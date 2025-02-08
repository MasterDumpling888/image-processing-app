/* FILTER CLASS FOR ALL STATIC IMAGE FILTERS */
class GreyscaleFilter extends ImageProcessor { // class to apply the grey scale filter
  constructor(x, y, gap) {
    super(); // call the constructor of the parent class
    this.x = x; // x-coordinate of the image
    this.y = y; // y-coordinate of the image
    this.gap = gap; // gap between the images
  }

  greyScale(img) { // method to apply the grey scale filter
    let imgGrey = this.initializeImage(img); // initialize an image with the same dimensions as the input image

    for (let x = 0; x < img.width; x++) { // loop through the width of the image
      for (let y = 0; y < img.height; y++) { // loop through the height of the image
        let index = (x + y * img.width) * 4; // 4 because of rgba; to account for the alpha channel
        let r = img.pixels[index + 0]; // red channel
        let g = img.pixels[index + 1]; // green channel
        let b = img.pixels[index + 2]; // blue channel
        let a = img.pixels[index + 3]; // alpha channel

        // weighted average of the rgb values to get grayscale
        let avg = (r + g + b) / 3;
        let avgBright = myp5.min(255, avg * 1.2); //increase the brightness by 20%; ensure that the value is not greater than 255

        // set the pixels to the new grayscale value
        this.setColorChannel(imgGrey, index, avgBright, avgBright, avgBright, a);
      }
    }
    imgGrey.updatePixels(); // update the pixels of the image
    return imgGrey;
  }

  apply(img) { // method to apply the grey scale filter and draw first row of images
    myp5.image(img, this.x, this.y); // display the original image
    myp5.image(this.greyScale(img), this.x + this.gap, this.y); // display the grey scale image
  }
}

class ColourSplitFilter extends ImageProcessor { // class to apply the colour split filter
  constructor(x, y, gap, flag) {
    super(); // call the constructor of the parent class
    this.x = x; // x-coordinate of the image
    this.y = y; // y-coordinate of the image
    this.gap = gap; // gap between the images
    this.flag = flag; // flag to check if the threshold slider should be applied

    const thresholdGap = 50; // gap between the threshold sliders
    this.thresholdRed = (this.flag === true) ? this.initThreshold('red channel', x, y) : null; // initialize the threshold slider for the red channel if the flag is true
    this.thresholdGreen = (this.flag === true) ? this.initThreshold('green channel', x, y + thresholdGap) : null; // initialize the threshold slider for the green channel if the flag is true
    this.thresholdBlue = (this.flag === true) ? this.initThreshold('blue channel', x, y + thresholdGap * 2) : null; // initialize the threshold slider for the blue channel if the flag is true
  }

  colourSplit(img, colour, val = null) { // method to apply the colour split filter
    let imgSplit = this.initializeImage(img); // initialize an image with the same dimensions as the input image

    for (let x = 0; x < img.width; x++) { // loop through the width of the image
      for (let y = 0; y < img.height; y++) { // loop through the height of the image
        let index = (x + y * img.width) * 4; // 4 because of rgba; to account for the alpha channel
        let r = img.pixels[index + 0]; // red channel
        let g = img.pixels[index + 1]; // green channel
        let b = img.pixels[index + 2]; // blue channel
        let a = img.pixels[index + 3]; // alpha channel

        // set the pixels to the new RGB channel value
        let splitR = (colour === 'red') ? r : 0;
        let splitG = (colour === 'green') ? g : 0;
        let splitB = (colour === 'blue') ? b : 0;
        if (this.flag) { // if the flag is true apply the threshold slider
          [splitR, splitG, splitB] = this.applyThreshold(splitR, splitG, splitB, val);
        }
        this.setColorChannel(imgSplit, index, splitR, splitG, splitB, a); // set the colour channels of the image
      }
    }
    imgSplit.updatePixels(); // update the pixels of the image
    return imgSplit;
  }

  /** reference:
   * https://www.youtube.com/watch?v=ZEy0_NLhdSE
   */
  updateSlider(slider, img, colour, xPos) { // method to update the threshold slider
    slider.input(() => { // call the input function when the slider is moved
      myp5.image(this.colourSplit(img, colour, slider.value()), xPos, this.y); // display the image with the colour split filter according to the threshold slider value
    });
    myp5.image(this.colourSplit(img, colour, slider.value()), xPos, this.y); // display the image with the colour split filter
  }

  apply(img) { // method to apply the colour split filter and draw second & third row of images
    if (this.flag) { // if the flag is true apply the threshold images
      this.updateSlider(this.thresholdRed, img, 'red', this.x); // display the image with the red channel according to the threshold slider value
      this.updateSlider(this.thresholdGreen, img, 'green', this.x + this.gap); // display the image with the green channel according to the threshold slider value
      this.updateSlider(this.thresholdBlue, img, 'blue', this.x + this.gap * 2); // display the image with the blue channel according to the threshold slider value
    } else { // if the flag is false apply the colour split filter without the threshold slider
      myp5.image(this.colourSplit(img, 'red'), this.x, this.y);  // display the image with the red channel
      myp5.image(this.colourSplit(img, 'green'), this.x + this.gap, this.y); // display the image with the green channel
      myp5.image(this.colourSplit(img, 'blue'), this.x + this.gap * 2, this.y); // display the image with the blue channel
    }
  }
}

/** reference:
 * https://www.rapidtables.com/convert/color/rgb-to-hsv.html
 * http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
 * Colour space conversion section 7: Computer RGB colour space
 */
class ColourConvertFilter extends ImageProcessor { // class to apply the colour convert filter
  constructor(x, y, gap, flag) {
    super(); // call the constructor of the parent class
    this.x = x; // x-coordinate of the image
    this.y = y; // y-coordinate of the image
    this.gap = gap; // gap between the images
    this.flag = flag; // flag to check if the threshold slider should be applied

    const thresholdGap = 50; // gap between the threshold sliders
    this.thresholdXyz = (this.flag === true) ? this.initThreshold('rgb to xyz', x, y) : null; // initialize the threshold slider for the xyz channel if the flag is true
    this.thresholdHsv = (this.flag === true) ? this.initThreshold('rgb to hsv', x, y + thresholdGap) : null; // initialize the threshold slider for the hsv channel if the flag is true
  }

  rgbToXyz(img, val = null) { // method to apply the rgb to xyz filter
    let imgConvert = this.initializeImage(img); // initialize an image with the same dimensions as the input image
    let transformationMatrix = [ // transformation matrix for rgb to xyz
      [0.4124564, 0.3575761, 0.1804375],
      [0.2126729, 0.7151522, 0.0721750],
      [0.0193339, 0.1191920, 0.9503041]
    ]

    for (let x = 0; x < img.width; x++) { // loop through the width of the image
      for (let y = 0; y < img.height; y++) { // loop through the height of the image
        let index = (x + y * img.width) * 4; // 4 because of rgba; to account for the alpha channel
        let r = img.pixels[index + 0]; // red channel
        let g = img.pixels[index + 1]; // green channel
        let b = img.pixels[index + 2]; // blue channel
        let a = img.pixels[index + 3]; // alpha channel

        let rx = transformationMatrix[0][0] * r + transformationMatrix[0][1] * g + transformationMatrix[0][2] * b; // calculate the red channel value
        let gx = transformationMatrix[1][0] * r + transformationMatrix[1][1] * g + transformationMatrix[1][2] * b; // calculate the green channel value
        let bx = transformationMatrix[2][0] * r + transformationMatrix[2][1] * g + transformationMatrix[2][2] * b; // calculate the blue channel value

        if (this.flag) { // if the flag is true apply the threshold slider
          [rx, gx, bx] = this.applyThreshold(rx, gx, bx, val);
        }
        this.setColorChannel(imgConvert, index, rx, gx, bx, a); // set the colour channels of the image
      }
    }
    imgConvert.updatePixels(); // update the pixels of the image
    return imgConvert;
  }

  rgbToHsv(img, val) { // method to apply the rgb to hsv filter
    let imgConvert = this.initializeImage(img); // initialize an image with the same dimensions as the input image
    for (let x = 0; x < img.width; x++) { // loop through the width of the image
      for (let y = 0; y < img.height; y++) { // loop through the height of the image
        let index = (x + y * img.width) * 4; // 4 because of rgba; to account for the alpha channel
        let r = img.pixels[index + 0]; // red channel
        let g = img.pixels[index + 1]; // green channel
        let b = img.pixels[index + 2]; // blue channel
        let a = img.pixels[index + 3]; // alpha channel

        r /= 255, g /= 255, b /= 255; // convert the rgb values to the range 0 to 1

        let max = Math.max(r, g, b); // calculate the maximum value of the rgb channels
        let min = Math.min(r, g, b); // calculate the minimum value of the rgb channels
        let h, s, v = max; // initialize the hue, saturation and value
        let d = max - min; // calculate the difference between the maximum and minimum value

        s = max === 0 ? 0 : d / max; // calculate the saturation

        if (max === min) { // if the maximum and minimum values are the same
          h = 0; // achromatic
        } else { // if the maximum and minimum values are different
          switch (max) { // switch statement to calculate the hue
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        h *= 255, s *= 255, v *= 255; // convert the hsv values to the range 0 to 255
        if (this.flag) { // if the flag is true apply the threshold slider
          [h, s, v] = this.applyThreshold(h, s, v, val);
        }
        this.setColorChannel(imgConvert, index, h, s, v, a); // set the colour channels of the image
      }
    }
    imgConvert.updatePixels(); // update the pixels of the image
    return imgConvert;
  }

  /** reference:
   * https://www.youtube.com/watch?v=ZEy0_NLhdSE
   */
  updateSlider(img) { // method to update the threshold slider
    this.thresholdXyz.input(() => { // call the input function when the slider is moved
      myp5.image(this.rgbToXyz(img, this.thresholdXyz.value()), this.x + this.gap, this.y); // display the image with the xyz channel according to the threshold slider value
    });
    myp5.image(this.rgbToXyz(img, this.thresholdXyz.value()), this.x + this.gap, this.y); // display the image with the xyz channel
    this.thresholdHsv.input(() => { // call the input function when the slider is moved
      myp5.image(this.rgbToHsv(img, this.thresholdHsv.value()), this.x + this.gap * 2, this.y); // display the image with the hsv channel according to the threshold slider value
    });
    myp5.image(this.rgbToHsv(img, this.thresholdHsv.value()), this.x + this.gap * 2, this.y); // display the image with the hsv channel
  }


  apply(img) { // method to apply the colour convert filter and draw fourth & fifth row of images
    if (this.flag) { // if the flag is true apply the threshold images
      this.updateSlider(img); // display the images with the rgb to xyz and hsv channels according to the threshold slider value
    } else {
      myp5.image(img, this.x, this.y); // display the original image
      myp5.image(this.rgbToXyz(img), this.x + this.gap, this.y); // display the image with the xyz channel
      myp5.image(this.rgbToHsv(img), this.x + this.gap * 2, this.y); // display the image with the hsv channel 
    }
  }
}
