/*  Discuss your findings e.g. image thresholding using each colour channel 
• What problems have you faced and were you able to solve them? 
• Were  you  on  target  to  successfully  complete  your  project?  If  not,  how  would  you 
address the issue/s and do things differently? 
• Also discuss your extension and why it is a unique idea The  report  quality  (i.e.  language)  will  also  be  assessed.  Be  precise  and  deliver  the  
information within 500 words. Include this in your main .js file.

REPORT:
  **Observations on Thresholding:
      Color Channel Thresholding Observation:
        Summary: Thresholding an image reveals the contrast and disparities within its color channels. Notably, the amount of detail varies across each RGB channel, influenced by brightness and exposure. Testing with a threshold value of 127 yielded the following:
        * Red Channel: Inconsistent contrast was observed due to overexposure, leading to a lack of detail. Lighter values were predominant, particularly affecting skin tones.
        * Green Channel: Displayed the highest level of detail and contrast, notably capturing midtones effectively.
        * Blue Channel: Despite being underexposed, it exhibited marginally more detail than the red channel, albeit less than the green channel. Shadows were predominant.
        Conclusion: Red tends to encapsulate lighter values, green highlights midtones, while blue emphasizes shadows.

      Colour Conversion Thresholding Observation:
        Summary: Comparing thresholding results from color channels to converted images, the latter generally showcased enhanced detail and balance, especially in darker regions (threshold value: 127).
        *XYZ Color Space: Extracted details and colors from dark areas effectively, albeit slightly messier due to increased color variation. Lower threshold values accentuated undertones before black pixels replaced them, resulting in vibrant images. With the threshold applied to the XYZ image, it revealed more vibrance as compared to the XYZ colour space wihtout the threshold.
        *HSV Color Space: More resistant to thresholding due to the necessity for values below 0, leading to a noisy image. However, it excelled in extracting detail from darker areas much more that the XYZ colour space and the colour split channels.
        Conclusion: XYZ is adept at extracting vibrant colors, while HSV excels in detailing darker areas.
  **Complications:
      *Refactoring posed significant challenges due to inadequate scoping for modularization at the initial stage of development. Utilizing classes helped limit global variables. However, exectution of this solution posed as a challenge as several atttempts were made to implement the classes. Eventually it was evident that certain functions and variable needed to remain in teh global scope through the trial and error process.
      *Face detection API required global scope for certain functions, complicating refactoring. Addressed by leaving callback functions in the global scope whilst creating a class for face filters to better structure the code.
      *Code optimization proved difficult, particularly with lag during image filter application. Implemented a function to update canvas only upon specific user input, reducing script time.
  **Target Completion:
      The project progressed on track during function creation but faced delays during optimization and refactoring due to insufficient modularization initially. Hopefully, I can improve on this in the future, by utilising planning techniques, such as diagrams, to structure my code better..
  **Extension:
      Added a mask filter to the face detection section and other video tracking features in another HTML page.

      The mask filter applies user-selected images onto detected faces using similar logic as other face filters.

      A separate HTML page optimized memory and processing power for video tracking features: object detection, features drawing, optical flow. Utilized two separate p5 instances to create two different canvases, essential for handling the resource-intensive video tracking features separately from other filters.
*/

/* -------------------------------------------------------------------------- */
/* VARIABLES */
let imgPro; // stores the instance of the ImageProcessor class
let faceApply; // stores the instance of the FaceApply class

let filters; // store all filters under the ImageProcessor class that are for the static images
let faceFil = []; // store all face filters under the ImageProcessor class

let faceType; // stores the user's selected face filter type
/* ------------------------------- P5 INSTANCE FOR HOME PAGE ----------------------------------- */
const sketch = (p) => {
  /** reference:
   * https://editor.p5js.org/codingtrain/sketches/xBs9FR9JE
   * https://gorillasun.de/blog/the-p5-graphics-buffer/
   * https://learn.ml5js.org/#/reference/face-api
  */
  /* setup function. initialisation function. p5 native function. */
  p.setup = () => {
    /* INITIALISE CANVAS/SETTINGS */
    p.createCanvas(640, 800); // create canvas
    p.pixelDensity(1); // set pixel density to 1
    p.angleMode(p.DEGREES); // set angle mode to degrees
    p.background(255); // set the background to white

    /* INITIALISE VIDEO/SETTINGS */
    let constraints = { // set the constraints for the video capture; helps with optimization
      video: {
        mandatory: {
          maxWidth: 160,
          maxHeight: 120
        },
        optional: [{ maxFrameRate: 24 }]
      },
      audio: false
    };
    video = p.createCapture(constraints); // create video capture
    video.size(160, 120); // set the size of the video capture
    video.hide(); // hide the video HTML capture element

    buffer = p.createGraphics(video.width, video.height); // create a buffer to store the video frame

    faceApi = ml5.faceApi(video, () => { faceApi.detect(video, gotResults) }); // initialize the faceApi

    /* INITIALISE CLASSES */
    const pos = p.createVector(25, 25); // create a vector to store the position of the faceApply instance and image filters
    const gap = 150; // set the gap between the filters
    imgPro = new ImageProcessor(); // create an instance of the ImageProcessor class
    filters = ImageProcessor.setup(pos.x, pos.y, gap); // set the global filters object to the filters from the ImageProcessor class

    faceFil = filters.faceFilters; // set the global face filters to the face filters from the ImageProcessor class
    const maskArray = ['bear', 'pikachu', 'dog', 'cat']; // create an array to store the mask images
    faceApply = new FaceApply(pos.x, pos.y + gap * 4, maskArray); // create an instance of the FaceApply class; list of masks passed as an argument
  }

  /* draw function. continuously loops. p5 native function. updates the video frame.
Calls video pixel array and face filters */
  p.draw = () => {
    video.loadPixels(); //load pixels from the video so filter functions can access pixel array; needs to called continuously since video is updating
    faceApply.updateFace(); //calls the faceApply class to update the face filters to updated detections
  }

  /* handles keyboard interactions. p5 native function */
  p.keyPressed = () => {
    /* Snapshot handling */
    if (p.key == 's' || p.key == 'S') { // take snapshot
      faceType = ''; // reset the faceType
      buffer.background(video.get()); // set the buffer to the current video frame
      updateCanvas(); // call the updateCanvas function to display filtered images
    }

    /* User option handling */
    if (p.key == 'g' || p.key == 'G') { // if user presses 'g' or 'G', set the faceType to grey
      faceType = 'grey'; // set the faceType to grey for greyScale filter
    }
    if (p.key == 'b' || p.key == 'B') { // if user presses 'b' or 'B', set the faceType to blur
      faceType = 'blur'; // set the faceType to blur for blur filter
    }
    if (p.key == 'c' || p.key == 'C') { // if user presses 'c' or 'C', set the faceType to hsv
      faceType = 'hsv'; // set the faceType to hsv for rgbToHsv filter
    }
    if (p.key == 'p' || p.key == 'P') { // if user presses 'p' or 'P', set the faceType to pixel
      faceType = 'pixel'; // set the faceType to pixel for pixelate filter
    }
    if (p.key == 'm' || p.key == 'M') { // if user presses 'm' or 'M', set the faceType to mask
      // mask will overlay the mask image on the face
      faceType = 'mask'; // set the faceType to mask for mask filter
    }
  }
}
/* -------------------------------------------------------------------------- */
/* ------------------------------- CREATE P5 INSTANCE ----------------------------------- */
let myp5 = new p5(sketch); // create p5 instance with sketch as template
/* -------------------------------------------------------------------------- */

/* updates static processed images; calls ImageProcess class draw; draws images with no filter */
function updateCanvas() {
  myp5.background(255); //clear the canvas before drawing the new images
  buffer.loadPixels(); //load pixels from the buffer image so filter functions can access pixel array
  imgPro.draw(filters, buffer); //draws the images with filtered applied
}


