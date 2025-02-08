/* VARIABLES */
let vidTrack; // store the instance of the VideoTracking class
let userDetection; // store the user's choice of detection

/* ---------P5 INSTANCE FOR SECOND PAGE--------- */
const extraSketch = (p) => {
  /** reference:
   * https://editor.p5js.org/codingtrain/sketches/xBs9FR9JE
   * https://gorillasun.de/blog/the-p5-graphics-buffer/
   * https://www.youtube.com/watch?v=QEzRxnuaZCk&t=3s
   * https://learn.ml5js.org/#/reference/face-api
  */

  /* preload function. p5 native function. */
  p.preload = () => {  // preload the model before the sketch starts
    detector = ml5.objectDetector('cocossd', () => { // initialize the object detector and call the callback function only when video is loaded
      video.elt.addEventListener('loadeddata', () => {
        detector.detect(video, gotObjects);
      });
    });
    faceApi = ml5.faceApi(video, () => { // initialize the faceApi and call the callback function only when video is loaded
      video.elt.addEventListener('loadeddata', () => {
        faceApi.detect(video, detectionOptions, gotResults);
      });
    });
  }

  /* setup function. initialisation function. p5 native function. */
  p.setup = () => {
    /* INITIALISE CANVAS/SETTINGS */
    p.createCanvas(520, 390); // create canvas
    p.pixelDensity(1); // set pixel density to 1
    p.angleMode(p.DEGREES); // set angle mode to degrees
    p.background(255); // set the background to white

    /* INITIALISE VIDEO/SETTINGS */
    let constraints = { // set the constraints for the video capture; helps with optimization
      video: {
        mandatory: {
          maxWidth: 520,
          maxHeight: 390
        },
        optional: [{ maxFrameRate: 24 }]
      },
      audio: false
    };
    video = p.createCapture(constraints); // create video capture
    video.size(520, 390); // set the size of the video capture
    video.hide(); // hide the video HTML capture element

    /* INITIALISE CLASSES */
    flow = new FlowCalculator(step);  // create an instance of the FlowCalculator class
    vidTrack = new VideoTracking(0, 0); // create an instance of the VideoTracking class
  }

  /* draw function. continuously loops. p5 native function. updates the video frame.
Calls video pixel array and face filters */
  p.draw = () => {
    video.loadPixels(); //load pixels from the video so filter functions can access pixel array; needs to called continuously since video is updating
    vidTrack.loadOptions(); // load user choice of video detection
  }

  /* handles keyboard interactions. p5 native function */
  p.keyPressed = () => {
    /* Load handling */
    if (p.key === ' ') { // if user presses space, load the detection model according to user's detection choice
      if (userDetection === 'object') {
        detector.detect(video, gotObjects); // detect the objects in the video and call the gotObjects function
      }
      if (userDetection === 'face') {
        faceApi.detect(video, detectionOptions, gotResults); // detect the faces in the video and call the gotResults function
      }

    }

    /* User option handling */
    if (p.key === '1') { // if user presses 1 set userDetection to object
      userDetection = 'object'; // set the userDetection to object
    }
    if (p.key === '2') { // if user presses 2 set userDetection to face
      userDetection = 'face'; // set the userDetection to face
    }
    if (p.key === '3') { // if user presses 3 set userDetection to opticalFlow
      userDetection = 'opticalFlow'; // set the userDetection to opticalFlow
    }
  }
}
/* -------------------------------------------------------------------------- */
/* ------------------------------- CREATE P5 INSTANCE ----------------------------------- */
let myp5Extra = new p5(extraSketch); // create p5 instance with sketch as template
/* -------------------------------------------------------------------------- */
