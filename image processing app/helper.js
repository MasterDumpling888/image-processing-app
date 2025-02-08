/*------THIS IS A COMPLIATION OF ALL THE HELPER FUNCTIONS------*/
/* Globally accessible by separate p5 instances across different HTML pages */

/* GLOBAL VARIABLES FOR CAPTURE & IMAGE ELEMENTS
  (INITIALISATION IN SEPARATE P5 INSTANCES) */
let video; // video capture
let buffer; // buffer to store video frame

/* ------------------------------- FOR FACE API ----------------------------------- */
/** reference:
 * https://learn.ml5js.org/#/reference/face-api
*/
// face detection variables
let faceApi; // store ml5 face apit
let detections = []; // store face detection values

const detectionOptions = { // store the detection options for the face detection
  withLandmarks: true, // detect the landmarks/features of face
  withDescriptors: false,
}

function gotResults(err, result) { // callback function for face detection
  if (err) { // if there is an error, log the error
    console.log(err);
    return; // return from the function
  }
  detections = result; // set the detections to the result
  faceApi.detect(video, gotResults); // detect the faces in the video and call the gotResults function
}

/* ------------------------------- FOR OBJECT DETECTION ----------------------------------- */
/** reference:
 * https://learn.ml5js.org/#/reference/object-detector
 * https://editor.p5js.org/codingtrain/sketches/VIYRpcME3
*/
/* GLOBAL VARIABLES FOR OBJECT DETECTION */
let detector; // store the ml5 object detector
let objectDetections = []; // store the object detection values

function gotObjects(err, result) { // callback function for object detection
  if (err) { // if there is an error, log the error
    console.error(err);
    return; // return from the function
  }
  objectDetections = result; // set the objectDetections to the result
  detector.detect(video, gotObjects); // detect the objects in the video and call the gotObjects function
}

/* ------------------------------- FOR OPTICAL FLOW ----------------------------------- */
/** reference:
 * Graphics Programming Week 19 Optical Flow: https://www.coursera.org/learn/uol-graphics-programming/home/week/19
*/
/* GLOBAL VARIABLES FOR OPTICAL FLOW */
let flow; // store the optical flow class
let previousPixels; // store the previous pixels for the optical flow
const step = 8; // store the step for the optical flow

function same(a1, a2, stride, n) { // compare two arrays
  for (var i = 0; i < n; i += stride) {
    if (a1[i] != a2[i]) {
      return false;
    }
  }
  return true;
}

/* FLOW CALCULATOR CLASS */
// copied from https://github.com/anvaka/oflow
//updated to ES6 syntax
class FlowZone {
  constructor(x, y, u, v) {
    this.x = x;
    this.y = y;
    this.u = u;
    this.v = v;
  }
}

class FlowCalculator {
  constructor(step = 8) {
    this.step = step;
  }

  // assumes rgba images, but only uses one channel
  calculate(oldImage, newImage, width, height) {
    let zones = [];
    const step = this.step;
    const winStep = step * 2 + 1;

    let A2, A1B2, B1, C1, C2;
    let u, v, uu = 0, vv = 0;
    const wMax = width - step - 1;
    const hMax = height - step - 1;

    for (let globalY = step + 1; globalY < hMax; globalY += winStep) {
      for (let globalX = step + 1; globalX < wMax; globalX += winStep) {
        A2 = A1B2 = B1 = C1 = C2 = 0;

        for (let localY = -step; localY <= step; localY++) {
          for (let localX = -step; localX <= step; localX++) {
            const address = (globalY + localY) * width + globalX + localX;

            const gradX = (newImage[(address - 1) * 4]) - (newImage[(address + 1) * 4]);
            const gradY = (newImage[(address - width) * 4]) - (newImage[(address + width) * 4]);
            const gradT = (oldImage[address * 4]) - (newImage[address * 4]);

            A2 += gradX * gradX;
            A1B2 += gradX * gradY;
            B1 += gradY * gradY;
            C2 += gradX * gradT;
            C1 += gradY * gradT;
          }
        }

        const delta = (A1B2 * A1B2 - A2 * B1);

        if (delta !== 0) {
          /* system is not singular - solving by Kramer method */
          const Idelta = step / delta;
          const deltaX = -(C1 * A1B2 - C2 * B1);
          const deltaY = -(A1B2 * C2 - A2 * C1);

          u = deltaX * Idelta;
          v = deltaY * Idelta;
        } else {
          /* singular system - find optical flow in gradient direction */
          const norm = (A1B2 + A2) * (A1B2 + A2) + (B1 + A1B2) * (B1 + A1B2);
          if (norm !== 0) {
            const IGradNorm = step / norm;
            const temp = -(C1 + C2) * IGradNorm;

            u = (A1B2 + A2) * temp;
            v = (B1 + A1B2) * temp;
          } else {
            u = v = 0;
          }
        }

        if (-winStep < u && u < winStep && -winStep < v && v < winStep) {
          uu += u;
          vv += v;
          zones.push(new FlowZone(globalX, globalY, u, v));
        }
      }
    }

    this.flow = {
      zones,
      u: uu / zones.length,
      v: vv / zones.length
    };

    return this.flow;
  }
}