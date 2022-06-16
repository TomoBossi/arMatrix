// To do list:
//   - optimize cursor hover checks, without breaking anything
//   - highlight corresponding color in color palete when hovering on pixel, and inverse
//   - line tool, toggleable tools selection panel on lower right, use line tool logic to fill gaps when free drawing
//   - cut tool (keep part of matrix)
//   - fill tool (change all neighboring pixels of same value at once)
//   - rect tool, circle tool
//   - select -> copy/cut -> move tool
//   - hue shifting, somehow
//   - optimize display to lower amount of rectangles and/or lines, if at all possible
//   - turn buttons & palette into objects of their respective classes, better for referencing each button (instead of using label)

// Global variables
// Inner logic
p5.disableFriendlyErrors = false; // Simple performance optimization
document.addEventListener("keydown", (e) => e.ctrlKey && e.preventDefault()); // Prevent default ctrl + key functionality
document.addEventListener("contextmenu", (e) => e.preventDefault()); // Prevent context menu popup on right click
let verbose = false; // If true, prints m whenever a change is made to it
let a; // Placeholder for arrays
let m = []; // Matrix
let mw = 16; // Matrix width
let mh = 16; // Matrix height
let dv = 0; // Default matrix value
let mEmpty = true; // Matrix contains only dv
let mod = false; // m was modified during this frame
let mHist = []; // Matrix history
let cm = 0; // Current matrix, index for mh
let mCopy; // Placeholder for deep-copy of m
let pxChange = false; // m was modified on previous frames, while holding LMB

let button;
let valCol;
let val; // General iteration/indexing purposes
let i; // General iteration/indexing purposes
let x; // General matrix element iteration purposes
let y; // General matrix element iteration purposes
let col; // General cPalette element iteration purposes
let isSelected; // General selected element purposes

// General visuals
let xpx1;
let xpx2;
let ypx1;
let ypx2; // Pixel coordinates of corner of matrix element
let w; // Sketch width  (set in setup)
let h; // Sketch height (set in setup)
let pxd = 1; // Pixel density 
let pxwh = 20; // True pixels of width and height of each square at the default zoom level
let zoom = 1.0; // Amount of zoom, default 1
let minZ = 1/pxwh; // Lower bound of allowed zoom range
let maxZ = 5; // Upper bound of allowed zoom range
let zoomInKb; // Holding + key
let zoomOutKb; // Holding - key
let zoomInW; // Mouse wheel scrolling up
let zoomOutW; // Mouse wheel scrolling down
let s = pxwh*zoom; // Actual size (width and height) of each square
let mwpx = s*mw; // Width of matrix in pixels
let mhpx = s*mh; // Height of matrix in pixels
let hRef; // Horizontal reference pixel
let vRef; // Vertical reference pixel
let hPan = 0; // Horizontal camera pan
let vPan = 0; // Vertical camera pan
let bgc = 35; // Background color
let tca = [255, 69]; // Text color and alpha (constant)
let lineca = [120, 255]; // Gridline color (constant) and alpha (based on zoom, dynamic)
let linew = 1; // Gridline width (based on zoom, dynamic)
let totColors = 32; // Palette size
let colorsPerRow = 16; // Colors per palette row
let cPaletteRows; // Number of rows on color palette
let row; // Palette row index
let rC; // Random color
let nNeg = 0; // Number of negative values, must be at least 0 and at most totColors - 1 (constrained in setup)
let cPaletteFixed = [[-1, [222,  82,  82], [222,  82,  82], 0, 0, false],
                     [ 0, [bgc, bgc, bgc], [bgc, bgc, bgc], 0, 0, false],
]; // Index based value-color array, [0:value, 1:cPick, 2:tempPick, 3:buttonx, 4:buttony, 5:cursorOnTop] (value and position data set in setup)
let nFixedColors = cPaletteFixed.length; // Number of preselected colors
let cPalette = []; // Holds all color palette data

// Interactivity & related visuals
let uipx = 30; // UI button length
let uibcpx = uipx/10; // UI curved border amount
let uisdpx = uipx/10; // UI shadow X, Y displacement
let uibc = 80; // UI button color
let uisc = bgc/2; // UI shadow color
let uihc = 200; // UI highlight color
let uihcoff = uihc*3/4; // UI highlight color (tool disabled, uihcoff < uihc)
let hcFillValue; // Placeholder variable for either uihc or uihcoff, accordingly
let uipscl = 0.75; // Scale of palette buttons in relation to the rest of the buttons
let uipxp = uipx*uipscl; // Palette button length
let undoredo = true; // Undo or Redo was used during the previous frame, init value must be true
let clickButtonArray = [[0, 0, undo, undoButton, null, 'undo', 'ctrl + Z', false],
                        [0, 0, redo, redoButton, null, 'redo', 'ctrl + shift + Z', false],
                        [0, 0, reCenter, reCenterButton, null, 'recenter', 'R', false],
                        [0, 0, upScale, upScaleButton, 2, 'upscale', '', false],
                        [0, 0, null, loadButton, null, 'load', '', false], // Special case, uses hidden DOM element
                        [0, 0, saveFile, saveButton, null, 'save', 'ctrl + S', false],
                        [0, 0, openSaveMenu, savePNGButton, null, 'save image', 'ctrl + shift + S', false], // Triggers save interface, not saving itself
]; // Holds all relevant clickable button data in the form [[0:xPos, 1:yPos, 2:function, 3:drawFunction, 4:functionArgs, 5:label, 6:kbShortcutLabel, 7:cursorOnTop] for each button]. Take care if modifying labels, as they are used to reference buttons in the code. Mostly set in setup.
let bx;
let by;
let on;
let bdraw; // Placeholders for button information (x, y, cursorOnTop, func)
let nClickButtons = clickButtonArray.length; // Number of clickable buttons
let ctrl = false; // Ctrl key is being held down
let shift = false; // Shift key is being held down

let cPick; // Color picked from color wheel
let cHover; // Color under pointer from color wheel
let cPicking = false; // Currently picking a color using the color wheel
let cPickedHolding = false; // cPicking just turned false because of mouse press, currently holding down mouse button
let clickedOnColor = false; // On mouse click, some color from the palette was clicked
let cPickingIndex = null; // Index (cPalette) of color being currently picked
let cSelectIndex; // Index (cPalette) of currently selected color (set in setup, defaults to 1 if possible)

let vMod = false; // Currently modifying luminosity value on color wheel
let v = 0.8; // Luminosity value
let pxIndex; // Index of current pixel while hovering over color wheel
let cWheel; // Holds the actual wheel image, precomputed in setup
let cWx; // Color wheel x pos (set in setup)
let cWy; // Color wheel y pos (set in setup)
let cWd = uipx*4; // Color wheel diameter
let cWr = cWd/2; // Color Wheel radius
let onGUI; // Mouse pointer currently close to GUI elements (palette, tools, etc.)
let cPalettew;
let cPaletteh;
let clickButtonsw;
let clickButtonsh;
let cWheelw;
let cWheelh; // Size (width and height) of GUI element (set in setup)
let onPalette;
let onClickButtons;
let onWheel; // Mouse pointer currently close to a particular GUI element section
let numkeyType; // 48 or 96, depending on which numeric keys are being used
let mouseIndex; // Holds output from mousePosToMatrixIndex()
let wheelDelta; // temporary holder of last mouse wheel scroll value
let onHelp = false; // Mouse pointer currently close of help GUI element (set in mouseOnGUI())
let onHelpButton = false; // Mouse pointer currently on top of help button
let helping = false; // Currently showing help overlay
let helped = false; // Was showing help overlay on previous frame
let helpbx; // Help button x pos (set in setup)
let helpby; // Help button y pos (set in setup)

// cWheel shader
let radius;
let ww;
let wh;
let cx;
let cy;
let rx;
let ry;
let cH;
let cS; // cWheel properties

// Save image menu
let saveMenuing = false; // Currently viewing save menu
let saveMenuOpened = false; // Save menu opened on current frame
let saveMenuGUIw;
let saveMenuGUIh; // Width and height of the entire GUI element and surroundings (set in setup)
let saveMenuGUIx;
let saveMenuGUIy; // Center xpos and ypos of GUI element
let onSaveMenu; // Mouse pointer currently close to GUI element
let menupxw;
let menupxh; // Save menu window xpos, ypos, width and height (set in setup)
let menuDeltah; // Save menu y displacement from center (set in setup)
let stillSaveMenuing; // Didn't exit menu on current frame
let uimbc = bgc*1.5; // UI menu background color
let savePxScale = 1;
let saveCrop = false;
let saveTrans = false; // Function parameters for savePNG
let tempScale; // Holds str version of savePxScale
let biphasicToggle = false; // Alternates between true and false, half of the time each, every biphasicPeriod frames
let biphasicPeriod = 30;
let backToMinScale = true; // deleted all digits or scrolled down, reached 1
let onScaleUp = false;
let onScaleDown = false;
let onCrop = false;
let onTrans = false; 
let onExit = false; 
let onMenuSaveButton = false; // Cursor on top of UI element
let maxScale = 30; // Max px scale value, min is always 1
let toggleSize;
let saveMenuButtonx;
let scaley;
let cropy;
let transy;
let scaleUpy;
let scaleDowny;
let scaleH; // Button positions and sizes, toggleSize and saveMenuButtonx shared by scale, crop and trans (set in setup)
let exitx;
let exity; // exit button xpos and ypos (set in setup), uses toggleSize for side length
let menuSaveButtonx;
let menuSaveButtony; // save button xpos and ypos (set in setup), uses uipx for side length



function setup() {  
  // Initialize canvas
  w = constrain(windowWidth,  666, windowWidth);
  h = constrain(windowHeight, 500, windowHeight);
  createCanvas(w, h);
  // Misc
  smooth();
  imageMode(CENTER);
  ellipseMode(CENTER);
  rectMode(CENTER);
  hRef = (w-mwpx)/2;
  vRef = (h-mhpx)/2;
  // Precompute cWheel
  cWheelShader();
  // Initialize m
  initMatrix();
  // Initialize GUI
  initGUI();
  // Initilize history
  mHist.push([deepCopy2D(m), getCurrentPalette()]);
}



function draw() {
  background(bgc);
  // Update zoom and pan
  updateZoom(minZ, maxZ);
  updatePan();
  // Check if mouse on GUI elements
  mouseOnGUI();
  // Draw matrix
  drawGrid();
  // Drawing tools
  freeDraw();
  // GUI display and interaction (except for mouseClicked, mouseReleased, mouseWheel and keyPressed)
  checkCursorHover();
  drawClickButtons();
  drawColorPalette();
  mouseHeldInteractions();
  drawColorWheel();
  updateHoverColor();
  showHelp();
  checkIfEmpty();
  saveMenu();
  // History
  mModHandler();
  // Debug
  // GUIdebug();
}



function initMatrix() {
  for (let y = 0; y < mh; y++) {
    m[y] = [];
    for (let x = 0; x < mw; x++) {
      m[y][x] = dv;
    }
  }
}



function initGUI() {
  initSaveMenu();

  i = 1;
  for (let button of clickButtonArray) {
    button[0] = w-uipx/1.25;
    button[1] = (i*2-1)*uipx/1.25;
    i++;
  }
  
  nNeg = constrain(nNeg, 0, totColors - 1);
  cSelectIndex = constrain(nNeg+1, nNeg, totColors-1);
  for (let i = -nNeg; i < totColors - nNeg; i++) {
    if (i < -1 || i > nFixedColors - 2) {
      rC = [random(255), random(255), random(255)];
      cPalette.push([i, [...rC], [...rC], 0, 0]);
    } else {
      cPalette.push([i, [...cPaletteFixed[i+1][1]], [...cPaletteFixed[i+1][2]], 0, 0, false]);
    }
  }
  
  i = 1;
  for (let valCol of cPalette) {
    row = floor((i-1)/colorsPerRow);
    valCol[3] = (uipx/1.25-uipx/2+uipx/2*uipscl)+(i*2-2 - row*2*colorsPerRow)*uipx/1.25*uipscl;
    valCol[4] = (uipx/1.25-uipx/2+uipx/2*uipscl)+(row*2)*uipx/1.25*uipscl;
    i++;
  }
  
  cPaletteRows = floor(totColors/colorsPerRow);
  cPalettew = (uipx/1.25-uipx/2)+(colorsPerRow)*2*(uipx/1.25)*uipscl - (uipx/1.25-uipx/2)*uipscl;
  cPaletteh = (uipx/1.25-uipx/2)+(cPaletteRows)*2*(uipx/1.25)*uipscl;
  clickButtonsw = 2*uipx/1.25;
  clickButtonsh = nClickButtons*2*uipx/1.25;
  cWheelw = cWd/8 + cWd*1.15;
  cWheelh = cWd*1.4;
  cWx = cWd/1.725 + uipx/5;
  cWy = cWd/1.725 + cPaletteh;
  helpbx = uipx/1.25-uipx/2+uipx/2*0.7;
  helpby = h - uipx/1.25+uipx/2-uipx/2*0.7;

  // Load file button functionality (Special case)
  load = createFileInput(loadFile);
  load.elt.style = "opacity: 0";
  load.size(uipx, uipx);
  i = 1;
  for (let button of clickButtonArray) {
    if (button[5] == 'load') {
      load.position(w-uipx/1.25-uipx/2, (i*2-1)*uipx/1.25-uipx/2);
    } i++;
  }
}



function drawGrid() {
  lineca[1] = 255 * map(zoom, minZ, 1, 0, 1);
  linew = constrain(map(zoom, minZ, 1, 0, 1), 0, 1);
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      xpx1 = hRef + x*s;
      ypx1 = vRef + y*s;
      xpx2 = xpx1 + s;
      ypx2 = ypx1 + s;
      stroke(lineca);
      strokeWeight(linew);
      fill(cPalette[m[y][x] + nNeg][2]);
      rect(xpx1, ypx1, s, s);
    }
  }
}



function mModHandler() {
  if (frameCount == 1 || mod) {
    if (!undoredo) { // If undo or redo, the problem gets adressed in undo() or redo()
      cm++;
      mHist = mHist.slice(0, cm);
      mHist.push([deepCopy2D(m), getCurrentPalette()]);
    }
    mod      = false;
    undoredo = false;
    pxChange = false;
    if (verbose) {
      console.log(JSON.stringify([m, getCurrentPalette()]));
    } 
  }
}


  
function updateZoom(min, max) {
  zoomInKb  = !saveMenuing && keyIsPressed && (key === '+');
  zoomOutKb = !saveMenuing && keyIsPressed && (key === '-');
  if (zoomInKb) {
    zoom *= 1.04;
  } else if (zoomOutKb) {
    zoom *= 0.96;
  }

  if (mouseIsPressed) {
    if (mouseButton === CENTER) {
      zoom -= 2*zoom*(mouseY-pmouseY)/h;
    }
  }
  
  if (wheelDelta && !saveMenuing) {
    zoomInW   = wheelDelta < 0;
    zoomOutW  = wheelDelta > 0;
    if (zoomInW) {
      zoom *= 1.15;
    } else if (zoomOutW) {
      zoom *= 0.85;
    }
    wheelDelta = 0;
    zoomInW = false
    zoomOutW = false
  }

  if (zoomInKb || zoomOutKb || zoomInW || zoomOutW){
    helping = false;
  }

  zoom = constrain(zoom, min, max);
  s    = pxwh*zoom;
  mwpx = s*mw;
  mhpx = s*mh;
}



function updatePan() {
  let p = pxwh/2;
  let r = !saveMenuing && (keyIsDown(RIGHT_ARROW) || (keyIsDown(68) && !(ctrl || shift)));
  let l = !saveMenuing && (keyIsDown(LEFT_ARROW) || (keyIsDown(65) && !(ctrl || shift)));
  let u = !saveMenuing && (keyIsDown(UP_ARROW) || (keyIsDown(87) && !(ctrl || shift)));
  let d = !saveMenuing && (keyIsDown(DOWN_ARROW) || (keyIsDown(83) && !(ctrl || shift)));
  if (r) {
    hPan -= p;
  } if (l) {
    hPan += p;
  } if (u) {
    vPan += p;
  } if (d) {
    vPan -= p;
  }
  
  if (mouseIsPressed) {
    if (mouseButton === RIGHT) {
      hPan += (mouseX-pmouseX)/zoom;
      vPan += (mouseY-pmouseY)/zoom;
    }
  }
  
  if (r || l || u || d){
    helping = false;
  }

  hRef = (w-mwpx+s)/2 + hPan*zoom;
  vRef = (h-mhpx+s)/2 + vPan*zoom;
}



function reCenter() {
  hPan = 0;
  vPan = 0;
  zoom = 1.0;
}



function upScale(n) {
  let nmw = n*mw;
  let nmh = n*mh;
  let nm  = [];
  for (let y = 0; y < nmh; y++) {
    nm[y] = [];
    for (let x = 0; x < nmw; x++) {
      nm[y][x] = dv;
    }
  }
  for (let y = 0; y < nmh; y+=n) {
    for (let x = 0; x < nmw; x+=n) {
      for (let ny = y; ny < y+n; ny++) {
        for (let nx = x; nx < x+n; nx++) {
          nm[ny][nx] = m[ceil(y/n)][ceil(x/n)];
        }
      }
    }
  }
  m = nm;
  mw = nmw;
  mh = nmh;
  mod = true;
}



function reShapeMatrix(nmw, nmh) {
  // m is reshaped from bottom-left to up-right
  let nm  = [];
  let delta = nmh - mh;
  for (let y = 0; y < nmh; y++) {
    nm[y] = [];
    for (let x = 0; x < nmw; x++) {
      if (y-delta+1 > 0 && x < mw) {
        nm[y][x] = m[y-delta][x];
      } else {
        nm[y][x] = dv;
      }
    }
  }
  m = nm;
  mw = nmw;
  mh = nmh;
  mod = true;
}



function undo() {
  if (cm > 0) {
    cm--;
    nm = mHist[cm];
    m  = deepCopy2D(nm[0]);
    mw = m[0].length;
    mh = m.length;
    p  = deepCopy2D(nm[1]);
    setPalette(p);
    mod = true;
    undoredo = true;
  }
}



function redo() {
  if (cm < mHist.length-1) {
    cm++;
    nm = mHist[cm];
    m  = deepCopy2D(nm[0]);
    mw = m[0].length;
    mh = m.length;
    p  = deepCopy2D(nm[1]);
    setPalette(p);
    mod = true;
    undoredo = true;
  }
}



function saveFile(content) {
  let writer = createWriter('arMatrixSavefile.arm');
  writer.write(JSON.stringify([m, getCurrentPalette()]));
  writer.close();
}



function baseButton(x, y, color) {
  rectMode(CENTER);
  noStroke();
  fill(color);
  rect(x, y, uipx, uipx, uibcpx);
  noFill();
  strokeWeight(1);
  stroke(uihc, 100);
  rect(x, y, uipx-2, uipx-2, uibcpx);
  noStroke();
}



function reCenterButton(x, y) {
  fill(uisc);
  noStroke();
  rect(x + uisdpx, y + uisdpx, uipx, uipx, uibcpx);
  baseButton(x, y, uibc);
  fill(uihc);
  ellipse(x, y, uipx*2.25/3);
  fill(uibc);
  ellipse(x, y, uipx*1.9/3);
  fill(uihc);
  ellipse(x, y, uipx*1/5);
}



function upScaleButton(x, y) {
  fill(uisc);
  noStroke();
  rect(x + uisdpx, y + uisdpx, uipx, uipx, uibcpx);
  baseButton(x, y, uibc);
  noFill();
  strokeWeight(uipx/20);
  stroke(uihc, 150);
  rect(x-uipx*1/6, y-uipx*1/6, uipx*1/3);
  stroke(uihc);
  rect(x, y, uipx*2/3);
}



function undoButton(x, y) {
  if (cm == 0) {
    hcFillValue = uihcoff;
  } else{
    hcFillValue = uihc;
  }
  fill(uisc);
  noStroke();
  rect(x + uisdpx, y + uisdpx, uipx, uipx, uibcpx);
  baseButton(x, y, uibc);
  fill(hcFillValue);
  ellipse(x, y, uipx*1.8/3);
  fill(uibc);
  ellipse(x, y, uipx*1.4/3);
  rect(x-uipx/4.5, y-uipx/4.5, uipx/2.25);
  fill(hcFillValue);
  triangle(x, y-0.85*uipx/2.25, x, y-0.35*uipx/2.25, x-uipx/6, y-0.6*uipx/2.25);
}



function redoButton(x, y) {
  if (cm == mHist.length-1) {
    hcFillValue = uihcoff;
  } else{
    hcFillValue = uihc;
  }
  fill(uisc);
  noStroke();
  rect(x + uisdpx, y + uisdpx, uipx, uipx, uibcpx);
  baseButton(x, y, uibc);
  fill(hcFillValue);
  ellipse(x, y, uipx*1.8/3);
  fill(uibc);
  ellipse(x, y, uipx*1.4/3);
  rect(x+uipx/4.5, y-uipx/4.5, uipx/2.25);
  fill(hcFillValue);
  triangle(x, y-0.85*uipx/2.25, x, y-0.35*uipx/2.25, x+uipx/6, y-0.6*uipx/2.25);
}



function loadButton(x, y) {
  fill(uisc);
  noStroke();
  rect(x + uisdpx, y + uisdpx, uipx, uipx, uibcpx);
  baseButton(x, y, uibc);
  noFill();
  strokeWeight(uipx/20);
  stroke(uihc);
  rect(x, y, uipx*2/3);
  fill(uibc);
  noStroke();
  rect(x, y-uipx/7, uipx*2.5/3, uipx*1.75/3);
  fill(uihc);
  // triangle(x, y+uipx/10, x-uipx/10, y+uipx/4, x+uipx/10, y+uipx/4);
  stroke(uihc);
  line(x-uipx/5, y+uipx/20-uipx/20, x+uipx/5, y+uipx/20-uipx/20);
  line(x-uipx/5, y-uipx/10-uipx/20, x+uipx/5, y-uipx/10-uipx/20);
  line(x-uipx/5, y-uipx/4-uipx/20, x+uipx/5, y-uipx/4-uipx/20);
}



function saveButton(x, y) {
  fill(uisc);
  noStroke();
  rect(x + uisdpx, y + uisdpx, uipx, uipx, uibcpx);
  baseButton(x, y, uibc);
  noFill();
  strokeWeight(uipx/20);
  stroke(uihc);
  rect(x, y, uipx*2/3);
  fill(uibc);
  noStroke();
  rect(x, y-uipx/7, uipx*2.5/3, uipx*1.75/3);
  fill(uihc);
  stroke(uihc);
  line(x-uipx/5, y+uipx/4.5, x+uipx/5, y+uipx/4.5);
  noFill();
  triangle(x, y, x-uipx/5, y-uipx/4, x+uipx/5, y-uipx/4);
}



function savePNGButton(x, y) {
  fill(uisc);
  noStroke();
  rect(x + uisdpx, y + uisdpx, uipx, uipx, uibcpx);
  baseButton(x, y, uibc);
  noFill();
  strokeWeight(uipx/20);
  stroke(uihc);
  rect(x, y, uipx*2/3);
  fill(uihc);
  noStroke();
  triangle(x-uipx/4,y,x-uipx/4, y+uipx/4, x+uipx/7.5, y+uipx/4)
  triangle(x+uipx/4,y-uipx/6,x-uipx/20, y+uipx/4, x+uipx/4, y+uipx/4)
  circle(x-uipx/20, y-uipx/10, uipx/7)
}



function helpButton(x, y) {
  fill(uisc);
  noStroke();
  rect(x + uisdpx, y + uisdpx, uipx*0.7, uipx*0.7, uibcpx);
  rectMode(CENTER);
  fill(uibc);
  rect(x, y, uipx*0.7, uipx*0.7, uibcpx);
  fill(uihc);
  textAlign(CENTER, CENTER);
  textSize(uipx*0.7/1.25);
  stroke(uisc, 150);
  strokeWeight(uipx/10);
  textFont('Georgia');
  text('i', x, y+uipx/20);
  noFill();
  strokeWeight(1+1*(onHelpButton && !helping));
  stroke(uihc, 100+155*(onHelpButton && !helping));
  rect(x, y, uipx*0.7-2, uipx*0.7-2, uibcpx);
}



function drawClickButtons() {
  for (let button of clickButtonArray) {
    bx = button[0];
    by = button[1];
    bdraw = button[3];
    bdraw(bx, by);
    if (button[7] && !helping && ((button[5] != 'undo' && button[5] != 'redo') || (button[5] == 'undo' && cm > 0) || (button[5] == 'redo' && cm != mHist.length-1))) {
      noFill();
      stroke(uihc);
      strokeWeight(2);
      rect(bx, by, uipx-2, uipx-2, uibcpx);
    }
  }
  helpButton(helpbx, helpby);
}



function drawColorPalette() {
  for (let valCol of cPalette) {
    val = valCol[0];
    col = valCol[2];
    bx  = valCol[3];
    by  = valCol[4];
    on  = valCol[5];
    isSelected = cSelectIndex == val + nNeg;
    rectMode(CENTER);
    if (isSelected) {
      stroke(bgc);
      strokeWeight(uipxp/15);
      fill(uihc);
      rect(bx, by, uipxp*1.3, uipxp*1.3, uipxp/6);
      rect(bx, by+uipxp*1.4/1.65, uipxp*1.15/1.8, uipxp/6, uipxp/15);
    } else {
      noStroke();
      fill(uisc);
      rect(bx + uisdpx, by + uisdpx, uipxp, uipxp, uipscl*uibcpx);
      if (!helping && !isSelected && on) {
        stroke(bgc);
        strokeWeight(uipxp/15);
        fill(uihc);
        rect(bx, by, uipxp*1.3, uipxp*1.3, uipxp/6);
      }
    }
    noStroke();
    fill(col);
    rect(bx, by, uipxp, uipxp, uipxp/10);
    if (col[0] < 130 && col[1] < 130 && col[2] < 140) {
      fill(255, 50);
    } else {
      fill(0, 50);
    }
    rect(bx, by, uipxp, uipxp, uipxp/10);
    fill(col);
    rect(bx, by, uipxp/1.2, uipxp/1.2, uipxp/10);
  }
}



function showHelp() {
  if (helping) {
    background(bgc, 100);
    textFont('helvetica');
    textAlign(CENTER, CENTER);
    fill(uihc-50);
    stroke(uibc-50);
    strokeWeight(3);
    
    // Draw
    rect(w/2, h/2, 50, 80, 30);
    // fill(uihc+10);
    fill(cPalette[cSelectIndex][2]);
    rect(w/2-12.5, h/2-20, 25, 40, 5);
    noFill();
    stroke(uihc);
    strokeWeight(1.5);
    rect(w/2-12.5, h/2-20, 25-5, 40-5, 5);
    rect(w/2, h/2-10-3/2, 7+5, 20+5-3, 7);
    stroke(uibc-50);
    strokeWeight(3);
    fill(uihc-50);
    rect(w/2+12.5, h/2-20, 25, 40, 5);
    rect(w/2, h/2-10, 7, 20, 7);
    
    // Pan
    rect(w/2-100, h/2-55, 17, 17, 5);
    rect(w/2-100-17, h/2-55, 17, 17, 5);
    rect(w/2-100+17, h/2-55, 17, 17, 5);
    rect(w/2-100, h/2-72, 17, 17, 5);
    fill(uisc);
    triangle(w/2-100+0.25, h/2-55, w/2-100-0.25, h/2-55, w/2-100, h/2-55+0.35);
    triangle(w/2-100+0.25, h/2-72, w/2-100-0.25, h/2-72, w/2-100, h/2-72-0.35);
    triangle(w/2-100-17, h/2-55+0.25, w/2-100-17, h/2-55-0.25, w/2-100-17-0.35, h/2-55);
    triangle(w/2-100+17, h/2-55+0.25, w/2-100+17, h/2-55-0.25, w/2-100+17+0.35, h/2-55);
    fill(uihc-50);
    rect(w/2-100, h/2, 50, 80, 30);
    rect(w/2-100-12.5, h/2-20, 25, 40, 5);
    fill(uihc+10);
    // fill(cPalette[cSelectIndex][2]);
    rect(w/2-100+12.5, h/2-20, 25, 40, 5);
    fill(uihc-50);
    rect(w/2-100, h/2-10, 7, 20, 7);
    
    // Zoom
    rect(w/2+100-14, h/2-57, 22, 22, 5);
    rect(w/2+100+14, h/2-57, 22, 22, 5);
    fill(uisc);
    noStroke();
    textSize(20);
    textStyle(BOLD);
    text('+', w/2+100-14, h/2-57);
    text('-', w/2+100+14, h/2-57);
    stroke(uibc-50);
    fill(uihc-50);
    rect(w/2+100, h/2, 50, 80, 30);
    rect(w/2+100-12.5, h/2-20, 25, 40, 5);
    rect(w/2+100+12.5, h/2-20, 25, 40, 5);
    fill(uihc+10);
    // fill(cPalette[cSelectIndex][2]);
    rect(w/2+100, h/2-10, 7, 20, 7);
    fill(uihc-50);
    
    textStyle(BOLDITALIC);
    textSize(25);
    fill(uihc);
    text('pan', w/2-100, h/2+60);
    text('draw', w/2, h/2+60);
    text('zoom', w/2+100, h/2+60);
    textSize(20);
    textAlign(LEFT);
    text('color palette', helpbx-uipx*0.35, cPaletteh+10);
    textSize(15);
    textStyle(ITALIC);
    fill(uihc-50);
    text('click on a color once to select it, and a second time to modify it', helpbx-uipx*0.35, cPaletteh+30);
    text('is the background color', helpbx-uipx*0.35+(1.75*uipxp/1.75), cPaletteh+50); 
    textAlign(CENTER, CENTER);
    text('github.com/TomoBossi/ArMatrix', w/2, h-15);
    textAlign(RIGHT);
    textStyle(NORMAL);
    textSize(11);
    fill(uihc-30);
    for (let i = 0; i < clickButtonArray.length; i++) {
      text(clickButtonArray[i][6], w-2*uipx/1.25, clickButtonArray[i][1]+uipx/2.25);
    }
    textStyle(BOLDITALIC);
    textSize(15);
    fill(uihc);
    for (let i = 0; i < clickButtonArray.length; i++) {
      text(clickButtonArray[i][5], w-2*uipx/1.25, clickButtonArray[i][1]);
    }
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);

    i = 0;
    while (i < cPalette.length && val != dv) {
      val = cPalette[i][0];
      bx  = cPalette[i][3];
      by  = cPalette[i][4];
      if (val == dv) {
        stroke(0, 110);
        strokeWeight(3);
        fill(255, 200);
        textAlign(CENTER, CENTER);
        textFont('sans-serif');
        textSize(uipxp/1.75);
        text('BG', bx, by);
        textAlign(LEFT);
        stroke(uibc-50);
        text('BG', helpbx-uipx*0.35, cPaletteh+50);
        noFill();
        stroke(uihc);
        strokeWeight(2);
        rect(bx, by, uipxp, uipxp, uibcpx);
      }
      i++;
    }
  }
}



function checkCursorHover() {
  for (let button of clickButtonArray) {
    bx = button[0];
    by = button[1];
    button[7] = mouseX > bx - uipx/2 && mouseX < bx + uipx/2 && mouseY > by - uipx/2 && mouseY < by + uipx/2;
  }
  for (let valCol of cPalette) {
    bx = valCol[3];
    by = valCol[4];
    valCol[5] = mouseX > bx - uipxp/2 && mouseX < bx + uipxp/2 && mouseY > by - uipxp/2 && mouseY < by + uipxp/2;
  }
  onHelpButton = mouseX > helpbx - uipx/2*0.7 && mouseX < helpbx + uipx/2*0.7 && mouseY > helpby - uipx/2*0.7 && mouseY < helpby + uipx/2*0.7;
}



function mouseClicked() {
  // Clickable Buttons (upper right)
  for (let button of clickButtonArray) {
    let bx = button[0];
    let by = button[1];
    let on = button[7];
    let func = button[2];
    let args = button[4];
    if (func && on) {
      if (args) {
        func(args);
      } else {
        func();
      }
    }
  }
  // Help button
  if (helping) {
    helping = false;
    helped = true;
  }
  if (!helped && onHelpButton) {
    helping = true;
  } helped = false;
  
  // Colors
  // Palette
  clickedOnColor = false;
  for (let valCol of cPalette) {
    bx = valCol[3];
    by = valCol[4];
    on = valCol[5];
    i  = valCol[0] + nNeg;
    if (on) {
      clickedOnColor = true;
      if (i == cSelectIndex) {
        if (!cPicking) {
          if (!cPickedHolding) {
            cPickingIndex = i;
            cPicking = true;
          } else {
            cPickingIndex = null;
            cPicking = false;   
            cPickedHolding = false;
          }
        } else {
          cPickingIndex = null;
          cPicking = false;
        }
      } else {
        cPickedHolding = false;
        cPickingIndex = null;
        cPicking = false;
        cSelectIndex = i;
      }
    }
  } if (!clickedOnColor) {
      cPickedHolding = false;
  }
  // Wheel
  if (cPicking) {
    ww = cWd;
    wh = cWd;
    rx = mouseX - cWx -1;
    ry = mouseY - cWy -1;
    cS = (sqrt(sq(rx) + sq(ry)) / (0.95*cWr));
    if (cS <= 1.05) {
      cH = ((atan2(rx, ry) / PI) + 1.0) / 2;
      cPick = HSVtoRGB(cH, cS, v);
      cPalette[cPickingIndex][1] = [...cPick];
      cPickingIndex = null;
      cPicking = false;
      mod = true;
    }
  }
  // Save menu
  if (saveMenuing) {
    if (!onSaveMenu && !saveMenuOpened) {
      closeSaveMenu();
    }
    saveMenuOpened = false;
    if (onScaleUp) {
      savePxScale++;
      backToMinScale = false;
    } else if (onScaleDown) {
      if (savePxScale == 1) {
        backToMinScale = true;
      }
      savePxScale--;
    } 
    if (savePxScale > maxScale || savePxScale < 1) {
      savePxScale = constrain(savePxScale, 1, maxScale);
    } 
    if (onCrop && !isEmpty(m)) {
      saveCrop = !saveCrop;
    } 
    if (onTrans) {
      saveTrans = !saveTrans;
    } 
    if (onMenuSaveButton) {
      savePNG();
      closeSaveMenu();
    } 
    if (onExit) {
      closeSaveMenu();
    }
  }
}



function HSVtoRGB(h, s, v) {
  // https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
      s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return [r*255, g*255, b*255];
}



function updateHoverColor() {
  if (cPicking) {
    ww = cWd;
    wh = cWd;
    rx = mouseX - cWx -1;
    ry = mouseY - cWy -1;
    cS = (sqrt(sq(rx) + sq(ry)) / (0.95*cWr));
    if (cS <= 1.05) {
      cH = ((atan2(rx, ry) / PI) + 1.0) / 2;
      cHover = HSVtoRGB(cH, cS, v);
      cPalette[cPickingIndex][2] = [...cHover];
    } else {
      cPalette[cPickingIndex][2] = [...cPalette[cPickingIndex][1]]; // reset color to cPick
    }
  } else if (cPickingIndex) {
    cPalette[cPickingIndex][2] = [...cPalette[cPickingIndex][1]]; // reset color to cPick
  }
}



function mouseWheel(event) {
  wheelDelta = event.delta;
}



function deepCopy2D(a) {
  let copy = [];
  for (let y = 0; y < a.length; y++) {
    copy[y] = [...a[y]];
  }
  return copy;
}



function mouseReleased() {
  // Color wheel luminosity
  if (vMod) {
    vMod = false;
  }
  // Drawing
  if (pxChange) {
    mod = true;
    pxChange = false;
  }
}



function drawColorWheel() {
  if (cPicking) {
    noStroke();
    rectMode(CENTER);
    fill(uisc);
    rect(cWx + uisdpx, cWy + cWd/8 + uisdpx, cWd*1.15, cWd*1.4, cWd/8);
    fill(uibc-30);
    rect(cWx, cWy + cWd/8, cWd*1.15, cWd*1.4, cWd/8);
    noFill();
    stroke(uihc, 100);
    strokeWeight(1);
    rect(cWx, cWy + cWd/8, cWd*1.15-2, cWd*1.4-2, cWd/8);
    noStroke();
    rectMode(CORNER);
    tint(255*v);
    image(cWheel, cWx, cWy, cWd, cWd);
    stroke(uihc);
    strokeWeight(2);
    ellipse(cWx, cWy, cWd);
    noStroke();
    fill(uihc-50);
    rect(cWx-cWd/2, cWy + cWd/1.55 - cWd/160, cWd*v, cWd/80, cWd/80);
    fill(uibc);
    rect(cWx-cWd/2+cWd*v, cWy + cWd/1.55 - cWd/160, cWd*(1-v), cWd/80, cWd/80);
    fill(uihc);
    ellipse(cWx-cWd/2+v*cWd, cWy + cWd/1.55, cWd/20);
    rectMode(CENTER);
  }
}



function getCurrentPalette() {
  p = [];
  for (let valCol of cPalette) {
    p.push([...valCol[1]]);
  }
  return p;
}



function setPalette(p) {
  i = 0;
  for (let col of p) {
    cPalette[i][1] = [...col];
    cPalette[i][2] = [...col];
    i++;
  }
}



function keyPressed() {
  ctrl = keyIsDown(17);
  shift = keyIsDown(16);
  if (!saveMenuing) {
    if (keyCode === 73) {
      helping = !helping;
    } else {
      helping = false;
      if (keyCode === 90) {
        if (ctrl && !shift) {
          undo();
        } 
        if (ctrl && shift) {
          redo();
        }
      } if (keyCode === 82) {
        reCenter();
      } if (keyCode === 83) {
        if (ctrl && !shift) {
          saveFile();
        } 
        if (ctrl && shift) {
          openSaveMenu();
        }
      } for (let i = 0; i <= 9; i++) {
        numkeyType = 48 + (96-48)*(keyCode > 95);
        if (keyCode === i+numkeyType) {
          cPicking = false;
          cSelectIndex = i+nNeg;
        }
      } if (keyCode === 81) {
        cPicking = false;
        if (cSelectIndex > 0) {
          cSelectIndex--;
        }
      } if (keyCode === 69) {
        cPicking = false;
        if (cSelectIndex < totColors-1) {
          cSelectIndex++;
        }
      }
    }
  } else {
    stillSaveMenuing = keyCode === 144 || ctrl || shift;
    tempScale = str(savePxScale);
    if (keyCode === 38 || keyCode === 87 && (!ctrl && !shift)) {
      tempScale = str(savePxScale+1);
      backToMinScale = false;
      stillSaveMenuing = true;
    }
    if (keyCode === 40 || keyCode == 83 && (!ctrl && !shift)) {
      tempScale = str(savePxScale-1);
      backToMinScale = (savePxScale == 1);
      stillSaveMenuing = true;
    }
    for (let k of [...Array(58-48).keys()]) {
      numkeyType = 48 + (96-48)*(keyCode > 95);
      if (keyCode === k+numkeyType) {
        if (!backToMinScale) {
          tempScale += char(k+48);
        } else {
          tempScale = char(k+48);
        }
        backToMinScale = false;
        stillSaveMenuing = true;
      }
    }
    if (keyCode === 8) {
      if (savePxScale > 9) {
        tempScale = tempScale.slice(0, tempScale.length-1);
      } else {
        tempScale = '1'
        backToMinScale = true;
      }
      stillSaveMenuing = true;
    }
    savePxScale = int(tempScale)
    if (savePxScale > maxScale || savePxScale < 1) {
      savePxScale = constrain(savePxScale, 1, maxScale);
    }
    if (keyCode === 13 || (keyCode === 83 && ctrl && shift)) {
      savePNG();
      closeSaveMenu();
    }
    if (!stillSaveMenuing) {
      closeSaveMenu();
    }
  }
}



function mouseOnGUI() {
  onGUI = false;
  onPalette      = mouseX < cPalettew && mouseY < cPaletteh;
  onClickButtons = mouseX > (w - clickButtonsw) && mouseY < clickButtonsh;
  onWheel        = mouseX < cWheelw && mouseY < cPaletteh + cWheelh && mouseY > cPaletteh;
  onHelp         = mouseX < helpbx*2 && mouseY > 2*helpby - h;
  if (saveMenuing) {
    onSaveMenu  = mouseX < saveMenuGUIx + saveMenuGUIw/2 && mouseX > saveMenuGUIx - saveMenuGUIw/2
    onSaveMenu *= mouseY < saveMenuGUIy + saveMenuGUIh/2 && mouseY > saveMenuGUIy - saveMenuGUIh/2
  } else {
    onSaveMenu = false
  }
  if (onPalette || onClickButtons || (cPicking && onWheel) || onHelp || vMod || (saveMenuing && onSaveMenu)) {
    onGUI = true;
  }
}



function GUIdebug() {
  fill(255, 30);
  stroke(0, 100);
  strokeWeight(2);
  rectMode(CORNER);
  
  // cPalette
  rect(0, 0, cPalettew, cPaletteh);
  
  // Tools (upper right)
  rect(w - clickButtonsw, 0, clickButtonsw, clickButtonsh);
  
  // Color wheel
  if (cPicking) {
    rect(0, cPaletteh, cWheelw, cWheelh);
  }
  
  // Help
  rect(0, 2*helpby - h, 2*helpbx, 2*helpby);
  
  rectMode(CENTER);
  if (saveMenuing) {
    rect(saveMenuGUIx, saveMenuGUIy, saveMenuGUIw, saveMenuGUIh)
  }
}



function gridDebug() {
  fill(200)
  stroke(0, 100)
  strokeWeight(2)
  ellipse(hRef - s/2,          vRef - s/2,          10, 10);
  ellipse(hRef - s/2,          vRef - s/2 + s*mh,   10, 10);
  ellipse(hRef - s/2 + s*mw,   vRef - s/2,          10, 10);
  ellipse(hRef - s/2 + s*mw,   vRef - s/2 + s*mh,   10, 10);
}



function mousePosToMatrixIndex() {
  x = floor((constrain(mouseX, hRef - s/2 - 1, hRef - s/2 + s*mw + 1) - (hRef - s/2))/s);
  y = floor((constrain(mouseY, vRef - s/2 - 1, vRef - s/2 + s*mh + 1) - (vRef - s/2))/s);
  return [x, y, x >= 0 && x < mw && y >= 0 && y < mh];
}



function mouseHeldInteractions() {
  // Wheel
  if (cPicking && mouseIsPressed && mouseButton == LEFT) {
    if (vMod || ((mouseX > cWx-cWd/2-cWd/40 && mouseX < cWx+cWd/2+cWd/40) && (mouseY > cWy + cWd/1.8 && mouseY < cWy + cWd/1.3))) {
      v = constrain(map(mouseX, cWx-cWd/2, cWx+cWd/2, 0, 1), 0, 1);
      vMod = true;
    } else if (!vMod) {
      if (!onWheel) {
        cPicking = false;
        cPickingIndex = null;
        cPickedHolding = true;
      }
    }
  }
  // Help
  if (!onGUI && mouseIsPressed && (mouseButton == LEFT || mouseButton == RIGHT || mouseButton == CENTER)) {
    helping = false;
  }
}



function freeDraw() {
  if (mouseIsPressed && mouseButton == LEFT) {
    mouseIndex = mousePosToMatrixIndex();
    x = mouseIndex[0];
    y = mouseIndex[1];
    if (mouseIndex[2]) { // Mouse pointer is on top of grid
      if (!onGUI && !saveMenuing) {
        helping = false;
        if (m[y][x] != cSelectIndex - nNeg) {
          pxChange = true;
          m[y][x] = cSelectIndex - nNeg;
        }
      }
    }
  }
}



function isIn2Darray(elem, array) {
  for (let y = 0; y < array.length; y++) {
    for (let x = 0; x < array[0].length; x++) {
      if (array[y][x] == elem) {
        return true;
      }
    }
  }
  return false;
}



function isEmpty(array) {
  for (let y = 0; y < array.length; y++) {
    for (let x = 0; x < array[0].length; x++) {
      if (array[y][x] != dv) {
        return false;
      }
    }
  }
  return true;
}



function checkIfEmpty() {
  mEmpty = isEmpty(m);
}



function replaceCurrent(e) { // Auxiliary functions for file loading
  nmc = JSON.parse(e.target.result);
  m = nmc[0];
  mh = m.length;
  mw = m[0].length;
  setPalette(nmc[1]);
  reCenter();
  mod = true;
} function loadFile(file) {
  const reader = new FileReader();
  reader.onload = replaceCurrent;
  reader.readAsText(file.file);
}



function all(a) { // Auxiliary functions for image saving
  res = 1;
  for (let val of a) {
    res *= val;
  }
  return Boolean(res);
} function bgList(mRow, bgVal) {
  res = [];
  for (let val of mRow) {
    res.push(val == bgVal);
  }
  return res;
} function getCol(a, i) {
  res = [];
  for (let row of a) {
    res.push(row[i]);
  }
  return res;
} function cropPNG(a, bgVal, cropBg) {
  mCopy = deepCopy2D(a);
  if (cropBg && !mEmpty) {
    while (all(bgList(mCopy[mCopy.length-1], bgVal))) { // lower border
      mCopy = mCopy.slice(0,mCopy.length-1);
    } 
    while (all(bgList(mCopy[0], bgVal))) { // upper border
      mCopy = mCopy.slice(1,mCopy.length);
    }
    while (all(bgList(getCol(mCopy, mCopy[mCopy.length-1].length-1), bgVal))) { // right border
      i = 0;
      for (let row of mCopy) {
        row = row.slice(0,mCopy[mCopy.length-1].length-1);
        mCopy[i] = row;
        i++;
      }
    }
    while (all(bgList(getCol(mCopy, 0), bgVal))) { // left border
      i = 0;
      for (let row of mCopy) {
        row = row.slice(1);
        mCopy[i] = row;
        i++;
      }
    }
  }
  return mCopy;
} function upscalePNG(a, n) {
  let nmw = n*a[0].length;
  let nmh = n*a.length;
  let mCopy  = [];
  for (let y = 0; y < nmh; y++) {
    mCopy[y] = [];
    for (let x = 0; x < nmw; x++) {
      mCopy[y][x] = 0;
    }
  }
  for (let y = 0; y < nmh; y+=n) {
    for (let x = 0; x < nmw; x+=n) {
      for (let ny = y; ny < y+n; ny++) {
        for (let nx = x; nx < x+n; nx++) {
          mCopy[ny][nx] = a[ceil(y/n)][ceil(x/n)]
        }
      }
    }
  }
  return mCopy;
} function getPNG(a, c, bgVal, transBg) {
  let RGBA = createImage(a[0].length, a.length);
  RGBA.loadPixels();
  for (let i = 0; i < RGBA.width; i++) {
    for (let j = 0; j < RGBA.height; j++) {
      cLab = a[j][i];
      cVal = c[cLab+nNeg];
      RGBA.set(i, j, color(cVal[0], cVal[1], cVal[2], 255*(!transBg || cLab != bgVal)));
    }
  }
  RGBA.updatePixels();
  return RGBA;
} function savePNG(matrix = m, pxScale = savePxScale, bgVal = dv, cropBg = saveCrop, transBg = saveTrans) {
  let modM = getPNG(upscalePNG(cropPNG(matrix, bgVal, cropBg), pxScale), getCurrentPalette(), bgVal, transBg);
  modM.save('arMatrixImage', 'png');
}



function cWheelShader() {
  colorMode(HSB);
  ww = 500;
  wh = 500;
  radius = min(ww, wh) / 2.0;
  cx = ww/2;
  cy = wh/2;
  cWheel = createImage(ww, wh);
  cWheel.loadPixels();
  for (let x = 0; x < cWheel.height; x++) {
    for (let y = 0; y < cWheel.width; y++) {
      rx = x - cx;
      ry = y - cy;
      cS = (sqrt(sq(rx) + sq(ry)) / (radius));
      if (cS <= 1) {
        cH = ((atan2(rx, ry) / PI) + 1.0) / 2;
        cWheel.set(x, y, color(cH * 360, cS * 100, 100));
      }
    }
  }
  cWheel.updatePixels();
  colorMode(RGB);
}



function saveMenu() { // Relatively self-contained .png saving menu 
  if (saveMenuing) {
    push();
    translate(0, -menuDeltah);
    onScaleUp = false;
    onScaleDown = false;
    onCrop = false;
    onTrans = false;
    onExit = false;
    onMenuSaveButton = false;
    if (mouseX > saveMenuButtonx-toggleSize/2 && mouseX < saveMenuButtonx+toggleSize/2) {
      onScaleUp = (mouseY > scaleUpy-scaleH/2-menuDeltah && mouseY < scaleUpy+scaleH/2-menuDeltah);
      onScaleDown = (mouseY > scaleDowny-scaleH/2-menuDeltah && mouseY < scaleDowny+scaleH/2-menuDeltah);
      onCrop = (mouseY > cropy-toggleSize/2-menuDeltah && mouseY < cropy+toggleSize/2-menuDeltah);
      onTrans = (mouseY > transy-toggleSize/2-menuDeltah && mouseY < transy+toggleSize/2-menuDeltah);
    }
    onExit  = (mouseY > exity-toggleSize/2-menuDeltah && mouseY < exity+toggleSize/2-menuDeltah);
    onExit *= (mouseX > exitx-toggleSize/2 && mouseX < exitx+toggleSize/2)
    onMenuSaveButton  = (mouseY > menuSaveButtony-uipx/2-menuDeltah && mouseY < menuSaveButtony+uipx/2-menuDeltah);
    onMenuSaveButton *= (mouseX > menuSaveButtonx-uipx/2 && mouseX < menuSaveButtonx+uipx/2)
    if (frameCount%biphasicPeriod == 0) {
      biphasicToggle = !biphasicToggle;
    }
    if (wheelDelta) {
      backToMinScale = (wheelDelta < 0 && savePxScale == 1);
      savePxScale += wheelDelta/(abs(wheelDelta));
      savePxScale = constrain(savePxScale, 1, maxScale);
      wheelDelta = 0;
    }
    fill(uisc);
    noStroke();
    rect(saveMenuGUIx+uisdpx, saveMenuGUIy+uisdpx + menuDeltah, menupxw, menupxh, uibcpx);
    fill(uimbc);
    rect(saveMenuGUIx, saveMenuGUIy + menuDeltah, menupxw, menupxh, uibcpx);
    noFill();
    strokeWeight(1);
    stroke(uihc, 100);
    rect(saveMenuGUIx, saveMenuGUIy + menuDeltah, menupxw-2, menupxh-2, uibcpx);
    fill(bgc);
    line(saveMenuGUIx - menupxw/2 + uipx, scaley, saveMenuGUIx + menupxw/2 - uipx, scaley);
    line(saveMenuGUIx - menupxw/2 + uipx, cropy, saveMenuGUIx + menupxw/2 - uipx, cropy);
    line(saveMenuGUIx - menupxw/2 + uipx, transy, saveMenuGUIx + menupxw/2 - uipx, transy);
    strokeWeight(1+1*onScaleUp);
    stroke(uihc, 100+155*onScaleUp);
    rect(saveMenuButtonx, scaleUpy, toggleSize, scaleH, uibcpx);
    strokeWeight(1);
    stroke(uihc, 100);
    rect(saveMenuButtonx, scaley, toggleSize, toggleSize, uibcpx);
    strokeWeight(1+1*onScaleDown);
    stroke(uihc, 100+155*onScaleDown);
    rect(saveMenuButtonx, scaleDowny, toggleSize, scaleH, uibcpx);
    strokeWeight(1+1*onCrop*!mEmpty);
    stroke(uihc, 100+155*onCrop*!mEmpty);
    rect(saveMenuButtonx, cropy, toggleSize, toggleSize, uibcpx);
    if (mEmpty) {
      line(saveMenuButtonx-toggleSize/2.5, cropy-toggleSize/2.5, saveMenuButtonx+toggleSize/2.5, cropy+toggleSize/2.5);
      line(saveMenuButtonx+toggleSize/2.5, cropy-toggleSize/2.5, saveMenuButtonx-toggleSize/2.5, cropy+toggleSize/2.5);
    }
    strokeWeight(1+1*onTrans);
    stroke(uihc, 100+155*onTrans);
    rect(saveMenuButtonx, transy, toggleSize, toggleSize, uibcpx);
    noStroke();
    if (backToMinScale) {
      fill((uihc-bgc)*!biphasicToggle + bgc);
      rect(saveMenuButtonx + uipx/6, scaley, uipx/3, uipx/1.5, uibcpx);
      fill((uihc-uisc)*biphasicToggle + uisc);
    } else {
      fill(uihc);
      if (biphasicToggle) {
        rect(saveMenuButtonx + uipx/6, scaley+uipx/3.8, uipx/3, uipx/8, uibcpx);
      }
    }
    textSize(uipx/2);
    textAlign(RIGHT, CENTER);
    textFont('sans-serif');
    textStyle(NORMAL);
    noStroke();
    text(savePxScale, saveMenuButtonx + toggleSize/2 - uipx/10, scaley);
    fill(uihc);
    if (saveCrop) {
      rect(saveMenuButtonx, cropy, uipx/2, uipx/2, uibcpx);
    } if (saveTrans) {
      rect(saveMenuButtonx, transy, uipx/2, uipx/2, uibcpx);
    }
    triangle(saveMenuButtonx, saveMenuGUIy-2.85*toggleSize, saveMenuButtonx+5, saveMenuGUIy-2.85*toggleSize+5, saveMenuButtonx-5, saveMenuGUIy-2.85*toggleSize+5)
    triangle(saveMenuButtonx, saveMenuGUIy-1.15*toggleSize, saveMenuButtonx+5, saveMenuGUIy-1.15*toggleSize-5, saveMenuButtonx-5, saveMenuGUIy-1.15*toggleSize-5)
    textFont('helvetica');
    textAlign(LEFT, CENTER);
    textStyle(BOLDITALIC);
    stroke(uibc-50);
    strokeWeight(3);
    text('scale', saveMenuGUIx - menupxw/2 + uipx/1.15 - uipx/2, scaley);
    text('crop', saveMenuGUIx - menupxw/2 + uipx/1.15 - uipx/2, saveMenuGUIy);
    text('transparency', saveMenuGUIx - menupxw/2 + uipx/1.15 - uipx/2, transy);
    textStyle(NORMAL);
    textSize(uipx/2.9);
    fill(uihc-20);
    text('sets the size of each pixel', // (up to '+str(maxScale)+')', 
         saveMenuGUIx - menupxw/2 + uipx/1.15 - uipx/2, scaley+uipx/2.25);
    text('removes excess borders', saveMenuGUIx - menupxw/2 + uipx/1.15 - uipx/2, saveMenuGUIy+uipx/2.25);
    text('removes the background', saveMenuGUIx - menupxw/2 + uipx/1.15 - uipx/2, transy+uipx/2.25);
    fill(uisc);
    noStroke();
    rect(exitx+uisdpx, exity+uisdpx, toggleSize, toggleSize, uibcpx);
    fill(uimbc);
    rect(exitx, exity, toggleSize, toggleSize, uibcpx);
    noFill();
    strokeWeight(1 + 1*onExit);
    stroke(uihc, 100+155*onExit);
    rect(exitx, exity, toggleSize-2, toggleSize-2, uibcpx);
    stroke(uihc-30);
    strokeWeight(2);
    line(exitx-toggleSize/5, exity-toggleSize/5, exitx+toggleSize/5, exity+toggleSize/5)
    line(exitx-toggleSize/5, exity+toggleSize/5, exitx+toggleSize/5, exity-toggleSize/5)
    strokeWeight(1);
    stroke(uihc, 100);
    line(saveMenuGUIx - menupxw/2 + uipx, menuSaveButtony, menuSaveButtonx, menuSaveButtony);
    savePNGButton(menuSaveButtonx, menuSaveButtony);
    if (onMenuSaveButton) {
      noFill();
      stroke(uihc);
      strokeWeight(2);
      rect(menuSaveButtonx, menuSaveButtony, uipx-2, uipx-2, uibcpx);
    }
    fill(uihc);
    textFont('helvetica');
    textSize(uipx/2);
    textAlign(LEFT, CENTER);
    textStyle(BOLDITALIC);
    stroke(uibc-50);
    strokeWeight(3);
    text('save', saveMenuGUIx - menupxw/2 + uipx/1.15 - uipx/2, menuSaveButtony);
    textStyle(NORMAL);
    textSize(uipx/2.9);
    fill(uihc-20);
    text('enter / ctrl + shift + S', saveMenuGUIx - menupxw/2 + uipx/1.15 - uipx/2, menuSaveButtony+uipx/2.25);
    pop();
  }
}



function initSaveMenu() {
  saveMenuGUIx = w/2;
  saveMenuGUIy = h/2;
  menupxw = 8*uipx;
  menupxh = 7*uipx;
  saveMenuGUIw = menupxw+uipx;
  saveMenuGUIh = menupxh+uipx;
  menuDeltah = uipx/1.75;
  toggleSize = uipx/1.25;
  saveMenuButtonx = saveMenuGUIx+menupxw/2-uipx/1.15;
  scaley = saveMenuGUIy-2*toggleSize;
  cropy = saveMenuGUIy;
  transy = saveMenuGUIy+2*toggleSize; 
  scaleUpy = saveMenuGUIy-2.85*toggleSize;
  scaleDowny = saveMenuGUIy-1.15*toggleSize;
  scaleH = uipx/3;
  exitx = saveMenuButtonx;
  exity = transy + 2*toggleSize;
  menuSaveButtonx = saveMenuGUIx+menupxw/4.5;
  menuSaveButtony = transy+2*toggleSize;
}



function openSaveMenu() {
  if (!saveMenuing) {
    saveMenuing = true;
    saveMenuOpened = true;
    if (mEmpty) {
      saveCrop = false;
    }
  }
}



function closeSaveMenu() {
  saveMenuing = false;
  onSaveMenu = false;
  onScaleUp = false;
  onScaleDown = false;
  onCrop = false;
  onTrans = false;
  onExit = false;
  onMenuSaveButton = false;
}