/* Parent class for filters */
/** reference:
 * https://p5js.org/reference/
 */
class ImageProcessor {
  constructor() {
  }

  static setup(x, y, gap) { // static method to set up the filter classes according to x-y coordinates and gap
    const xGap = gap * 1.3; // set xGap to be proportional to the y-gap according to image ratio 4:3
    let filters = { // create an object to store the filter classes for static images
      grey: new GreyscaleFilter(x, y, xGap), // create an instance of the GreyscaleFilter class
      colour1: new ColourSplitFilter(x, y + gap, xGap, false), // create an instance of the ColourSplitFilter class
      colour2: new ColourSplitFilter(x, y + gap * 2, xGap, true), // create an instance of the ColourSplitFilter class with threshold sliders
      convert1: new ColourConvertFilter(x, y + gap * 3, xGap, false), // create an instance of the ColourConvertFilter class
      convert2: new ColourConvertFilter(x, y + gap * 4, xGap, true), // create an instance of the ColourConvertFilter class with threshold sliders
    }

    // populate the faceFilters array with the filter classes for face detection
    filters.faceFilters = [new GreyscaleFilter(), new BlurFilter(), new ColourConvertFilter(), new PixelateFilter()];

    return filters; // return the filters object
  }

  initializeImage(img) { // method to initialize an image with the same dimensions as the input image; for pixel manipulation
    let tempImg = myp5.createImage(img.width, img.height);
    tempImg.loadPixels(); // load the pixels of the image
    return tempImg;
  }

  initThreshold(title, x, y) { // method to initialize a threshold slider with a title
    let threshold = myp5.createSlider(0, 255, 127); // create a slider with a range of 0-255 and an initial value of 127
    let titleSlider = myp5.createP(title); // create a paragraph element with the title
    threshold.position(x, y); // set the position of the slider
    titleSlider.position(x, y - 30); // set the position of the title
    titleSlider.class('title-slider'); // set the class of the title
    threshold.class('slider'); // set the class of the slider
    return threshold;
  }

  applyThreshold(r, g, b, val) { // method to apply a threshold to the RGB values
    r = (r > val) ? 255 : 0; // if the red value is greater than the threshold, set it to 255, else set it to 0
    g = (g > val) ? 255 : 0; // if the green value is greater than the threshold, set it to 255, else set it to 0
    b = (b > val) ? 255 : 0; // if the blue value is greater than the threshold, set it to 255, else set it to 0
    return [r, g, b];
  }

  setColorChannel(img, index, r, g, b, a) { // method to set the colour channels of an image
    let value = [r, g, b, a];
    for (let i = 0; i < value.length; i++) { // loop through the colour channels
      img.pixels[index + i] = value[i]; // set the pixel value to the corresponding colour channel
    }
  }

  draw(filter, img) { // method to draw the filtered images
    filter.grey.apply(img); // apply the greyscale filter
    filter.colour1.apply(img); // apply the colour split filter without threshold sliders
    filter.colour2.apply(img); // apply the colour split filter with threshold sliders
    filter.convert1.apply(img); // apply the colour convert filter without threshold sliders
    filter.convert2.apply(img); // apply the colour convert filter with threshold sliders
  }
}
