/* VIDEO TRACKING CLASS */
class VideoTracking {
  /** reference:
  * https://learn.ml5js.org/#/reference/face-api
  * https://learn.ml5js.org/#/reference/object-detector
  * https://editor.p5js.org/codingtrain/sketches/VIYRpcME3
  * Graphics Programming Week 19 Optical Flow: https://www.coursera.org/learn/uol-graphics-programming/home/week/19
 */
  constructor(x, y) {
    this.x = x; // x-coordinate of video
    this.y = y; // y-coordinate of video
  }

  loadOptions() { // method to load the user choice of video detection
    if (userDetection === 'opticalFlow') { // if user chooses optical flow apply optical flow
      // called separately from handleDetections since optical flow is not an ml5 feature
      this.opticalFlowDraw();
    } else {
      this.handleDetections();
    }
  }

  handleDetections() { // method to handle the user choice of ml5 video detection
    myp5Extra.push();
    myp5Extra.translate(this.x, this.y); // translate the video according to the x and y coordinates
    myp5Extra.image(video, 0, 0);
    myp5Extra.stroke(0, 255, 0); // set the stroke colour to green
    myp5Extra.strokeWeight(2); // set the stroke weight to 2
    myp5Extra.textSize(24); // set the text size to 24
    myp5Extra.noFill(); // set the fill to none
    let d = userDetection === 'object' ? objectDetections : detections; // set the detection to the user's choice
    d.forEach(det => { // loop through the detections
      if (userDetection === 'object') { // if user chooses object detection apply object detection
        this.objectDetectDraw(det);
      }
      if (userDetection === 'face') { // if user chooses face detection apply feature replacement
        this.featureReplace(det);
      }
    })
    myp5Extra.pop();
  }

  objectDetectDraw(object) { // method to draw the object detection
    myp5Extra.noFill();
    myp5Extra.rect(object.x, object.y, object.width, object.height); // draw a rectangle around the object
    myp5Extra.noStroke(); // set the stroke to none
    myp5Extra.fill(255); // set the fill to white
    myp5Extra.text(object.label, object.x + 10, object.y + 24); // display the label of the object
    let percent = myp5Extra.nf(object.confidence * 100, 2, 0); // calculate the confidence of the object
    myp5Extra.text(percent, object.x + object.width - 50, object.y + object.height - 10); // display the confidence of the object
  }

  featureReplace(face) { // method to replace the face with the filter
    // assign the face parts to variables
    const mouth = face.parts.mouth;
    const nose = face.parts.nose;
    const leftEye = face.parts.leftEye;
    const rightEye = face.parts.rightEye;
    const rightEyeBrow = face.parts.rightEyeBrow;
    const leftEyeBrow = face.parts.leftEyeBrow;

    // draw the face parts
    this.drawPart(mouth, true);
    this.drawPart(nose, false);
    this.drawPart(leftEye, true);
    this.drawPart(leftEyeBrow, false);
    this.drawPart(rightEye, true);
    this.drawPart(rightEyeBrow, false);
  }

  drawPart(feature, closed) { // method to draw the face parts
    myp5Extra.beginShape();
    for (let i = 0; i < feature.length; i++) {
      const x = feature[i]._x
      const y = feature[i]._y
      myp5Extra.vertex(x, y)
    }

    if (closed === true) {
      myp5Extra.endShape(myp5Extra.CLOSE);
    } else {
      myp5Extra.endShape();
    }
  }

  opticalFlowDraw() { // method to apply optical flow
    if (video.pixels.length > 0) {
      if (previousPixels) {
        previousPixels.loadPixels();
        // cheap way to ignore duplicate frames
        if (same(previousPixels.pixels, video.pixels, 4, myp5Extra.width)) {
          return;
        }
        // calculate optical flow
        flow.calculate(previousPixels.pixels, video.pixels, video.width, video.height);
      }
      else previousPixels = myp5Extra.createImage(video.width, video.height);

      previousPixels.copy(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);
      myp5Extra.image(video, 0, 0);

      // code to visualise optical flow
      let totalV = 0, totalU = 0, count = 0;
      const threshold = 5;
      if (flow.flow && flow.flow.u != 0 && flow.flow.v != 0) {
        flow.flow.zones.forEach(zone => {
          if (myp5Extra.abs(zone.u) > threshold || myp5Extra.abs(zone.v) > threshold) { // only if movement is significant
            myp5Extra.noStroke();
            myp5Extra.fill(myp5Extra.map(zone.u, -step, +step, 0, 255),
              myp5Extra.map(zone.v, -step, +step, 0, 255), 128);
            myp5Extra.ellipse(zone.x, zone.y, 4, 4);
            totalU += zone.u;
            totalV += zone.v;
            count++;
          }
        });
      }
    }
  }
}