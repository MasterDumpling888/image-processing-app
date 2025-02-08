/* FACE APPLICATION CLASS*/
class FaceApply {
  /** reference:
   * https://learn.ml5js.org/#/reference/face-api
   */
  constructor(x, y, maskArray) {
    this.x = x; // x-coordinate of video with face detection
    this.y = y; // y-coordinate of video with face detection
    this.m = new Mask(maskArray); // create an instance of the Mask class
    this.m.loadMasks(); // load the mask images
    this.m.makeSelection(this.x, this.y + 100); // create the mask selection dropdown
  }

  updateFace() { // method to update the face detection
    myp5.image(video, this.x, this.y); // display the video with face detection
    for (let i = 0; i < detections.length; i++) { // loop through the face detections
      let face = detections[i];
      this.faceOptions(face, faceType); // apply the face filters
    }
  }

  faceOptions(face, f) { // method to apply the face filters according to user's choice
    if (faceType === 'grey') { // if user chooses grey apply grey scale filter
      this.faceReplace(faceFil[0].greyScale(video), face);
    } else if (f === 'blur') { // if user chooses blur apply blur filter
      this.faceReplace(faceFil[1].apply(video), face);
    } else if (f === 'hsv') { // if user chooses hsv apply hsv filter
      this.faceReplace(faceFil[2].rgbToHsv(video), face);
    } else if (f === 'pixel') { // if user chooses pixelate apply pixelate filter
      this.faceReplace(faceFil[3].apply(video), face);
    } else if (f === 'mask') { // if user chooses mask apply mask of user's choice
      this.placeMask(face);
    }
  }

  placeMask(face) { // method to place the mask on the face
    myp5.push();
    myp5.translate(this.x, this.y); // translate the video according to the x and y coordinates
    myp5.image(video, 0, 0);
    this.m.handleSelection(); // pass the current selected mask
    let pos = myp5.createVector(face.detection._box._x, face.detection._box._y - 15); // create a vector to store the position of the mask
    myp5.image(this.m.mask, pos.x, pos.y, face.detection._box._width, face.detection._box._width); // display the mask
    myp5.pop();
  }

  faceReplace(type, face) { // method to replace the face with the filter
    myp5.push();
    myp5.translate(this.x, this.y); // translate the video according to the x and y coordinates
    myp5.image(video, 0, 0);
    let f = type.get(face.detection._box._x, face.detection._box._y, face.detection._box._width, face.detection._box._height); // get the face from image according to the face detection
    myp5.image(f, face.detection._box._x, face.detection._box._y); // display the face with the filter
    myp5.pop();
  }


}
