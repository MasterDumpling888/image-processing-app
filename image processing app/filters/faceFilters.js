/* FILTER CLASSES EXCLUSIVE TO FACE FILTER */
class BlurFilter extends ImageProcessor {
  /** reference:
  * https://p5js.org/examples/image-blur.html
  */
  constructor() {
    super(); // call the constructor of the parent class
  }

  apply(img) { // method to apply the blur filter
    let imgBlur = this.initializeImage(img); // initialize an image with the same dimensions as the input image 
    let d = 36; // or any perfect square number
    let size = Math.sqrt(d); // size of the matrix
    let value = 1 / d; // value of each element in the matrix
    let kernel = Array(size).fill().map(() => Array(size).fill(value)); // create a 2D array with the value of each element in the matrix

    for (let x = 1; x < img.width - 1; x++) { // loop through the width of the image
      for (let y = 1; y < img.height - 1; y++) { // loop through the height of the image
        let index = (x + y * img.width) * 4; // 4 because of rgba; to account for the alpha channel
        let c = this.convolution(img, x, y, kernel); // apply the convolution to the image
        this.setColorChannel(imgBlur, index, c[0], c[1], c[2], img.pixels[index + 3]); // set the colour channels of the image
      }
    }
    imgBlur.updatePixels(); // update the pixels of the image
    return imgBlur;
  }

  convolution(img, x, y, matrix) { // method to apply the convolution to the image
    let sumR = 0, sumG = 0, sumB = 0; // initialize the sum of the colour channels to 0
    let offset = Math.floor(matrix.length / 2); // calculate the offset of the matrix

    for (let i = 0; i < matrix.length; i++) { // loop through the width of the matrix
      for (let j = 0; j < matrix.length; j++) { // loop through the height of the matrix
        let xOff = x + i - offset; // calculate the x-offset
        let yOff = y + j - offset; // calculate the y-offset
        let index = (xOff + yOff * img.width) * 4; // 4 because of rgba; to account for the alpha channel
        index = myp5.constrain(index, 0, img.pixels.length - 1); // constrain the index to the length of the pixels array
        sumR += img.pixels[index + 0] * matrix[i][j]; // sum the red channel
        sumG += img.pixels[index + 1] * matrix[i][j]; // sum the green channel 
        sumB += img.pixels[index + 2] * matrix[i][j]; // sum the blue channel
      }
    }
    return [sumR, sumG, sumB];
  }
}


class PixelateFilter extends ImageProcessor {
  /** reference:
 * https://img.ly/blog/how-to-pixelate-an-image-in-javascript/
 */
  constructor() {
    super(); // call the constructor of the parent class
  }

  apply(img) { // method to apply the pixelate filter
    let pixelSize = 5; // size of the pixel
    let imagePixelate = this.initializeImage(img); // initialize an image with the same dimensions as the input image
    for (let x = 0; x < img.width; x++) { // loop through the width of the image
      for (let y = 0; y < img.height; y++) { // loop through the height of the image
        let index = (x + y * img.width) * 4; // 4 because of rgba; to account for the alpha channel
        let p = this.pixelate(img, x, y, pixelSize); // apply the pixelate filter to the image
        for (let i = 0; i < pixelSize; i++) { // loop through the width of the pixel
          for (let j = 0; j < pixelSize; j++) { // loop through the height of the pixel
            let index2 = (x + i + (y + j) * img.width) * 4; // 4 because of rgba; to account for the alpha channel
            this.setColorChannel(imagePixelate, index2, p[0], p[1], p[2], img.pixels[index + 3]); // set the colour channels of the image
          }
        }
      }
    }
    imagePixelate.updatePixels(); // update the pixels of the image
    return imagePixelate;
  }

  pixelate(img, x, y, pixelSize) { // method to apply the pixelate filter to the image
    let xBlock = x - (x % pixelSize); // calculate the x-block 
    let yBlock = y - (y % pixelSize); // calculate the y-block
    let r = 0, g = 0, b = 0; // initialize the colour channels to 0
    let count = pixelSize * pixelSize; // number to calculate the average
    for (let i = 0; i < pixelSize; i++) { // loop through the width of the pixel
      for (let j = 0; j < pixelSize; j++) { // loop through the height of the pixel
        let index = (xBlock + i + (yBlock + j) * img.width) * 4; // 4 because of rgba; to account for the alpha channel
        r += img.pixels[index + 0]; // sum the red channel
        g += img.pixels[index + 1]; // sum the green channel
        b += img.pixels[index + 2]; // sum the blue channel
      }
    }
    r /= count; g /= count; b /= count; // calculate the average of the colour channels
    return [r, g, b];
  }
}

class Mask {
  /** reference & credits for the mask image used in this class:
   * https://www.seekpng.com/
   * https://www.pikpng.com/
   * https://www.pngegg.com/
   */
  constructor(masks) { // constructor to initialize the mask class
    this.masks = masks; // store the mask names from inputed array
    this.maskImages = []; // store the mask images according to mask names
    this.mask = myp5.createImage(1, 1); // create an image to store the selected mask
    this.selection = myp5.createSelect(); // create a select element to store the mask options
  }

  loadMasks() { // method to load the mask images according to the mask names
    this.masks.forEach(mask => { // loop through the mask names
      this.maskImages.push(myp5.loadImage('./assets/' + mask + '.png')); // load the mask images
    });
  }

  makeSelection(x, y) { // method to create the mask selection dropdown
    let selectionText = myp5.createP('Select a mask'); // create a paragraph element with the title
    selectionText.position(x, y - 30); // set the position of the title 
    this.selection.position(x, y); // set the position of the select element
    selectionText.class('selectionText'); // set the class of the title
    this.selection.class('selection'); // set the class of the select element
    this.masks.forEach(mask => { // loop through the mask names
      this.selection.option(mask); // add the mask names to the select element
    });
  }

  handleSelection() { // method to handle the mask selection
    this.masks.forEach((mask, i) => { // loop through the mask names
      if (this.selection.selected() === mask) { // check if the selected mask matches the mask name
        this.mask = this.maskImages[i].get(); // set the mask to the selected mask image
      }
    });
  }
}