// To be implemented using PyGame.

// Planned functionality: GUI for very easily creating and modifying 2D matrices
// 2D matrices could be of any given size/dimensions
// Visually and intuitively, the user should be able to: 
//   - see a grid where each position holds it's corresponding value and/or a color-coded representation (done)
//   - zoom in and out and pan around at will with a re-centering feature (done)
//   - increase the matrix resolution by an integer factor: Turn every pixel into a 2x2 or 3x3 etc. of the same value as original pixel (done, but factor is fixed and can only be changed from console)
//   - automatically console-log current matrix (done)
//   - change the matrix dimensions at any point (cut/fill with default depending on current matrix size) (done, but only doable from console)
//   - infinite undo/redo of moidifications (done)
//   - pick fill values intuitively (done)
//   - single pixel value modification (free draw tool (done), boolean mouseOnGUI function to prevent overlapping behaviours)
//   - multiple pixel value modification (rectangle tool, line tool, circle tool, free draw tool)
//   - select -> copy/cut -> move tool
//   - save/load/copy for js/numpy tool
//   - helper toggleable overlay with brief GUI explanations
//   - layers

// Global variables
// Inner logic
p5.disableFriendlyErrors = true
let m     = [] // Matrix
let mw    = 8 // Matrix width
let mh    = 8 // Matrix height
let dv    = 0 // Default matrix value
// let prevm = [] // Previous frame matrix
let mod   = false // m was modified during this frame
let pxChange = false // m was modified on previous frames, while holding LMB
let mHist = [] // Matrix history
let cm    = 0  // Current matrix, index for mh
let i // General indexing purposes
let x // General matrix element iteration purposes
let y // General matrix element iteration purposes

// General visuals
let xpx1
let xpx2
let ypx1
let ypx2 // Pixel coordinates of corner of matrix element
let w // Sketch width  (set in setup)
let h // Sketch height (set in setup)
let pxd    = 1 // Pixel density 
let pxwh   = 20   // True pixels of width and height of each square at the most zoomed-out level
let zoom   = 1.0  // Amount of zoom
let zFac   = 1.0  // Zoom constrained between 0 and 1
let minZ   = 0.25 // Lower bound of allowed zoom range
let maxZ   = 5    // Upper bound of allowed zoom range
let s      = pxwh*zoom // Actual size (width and height) of each square
let mwpx   = s*mw // Width of matrix in pixels
let mhpx   = s*mh // Height of matrix in pixels
let hRef   = 0 // Horizontal reference pixel
let vRed   = 0 // Vertical reference pixel
let hPan   = 0 // Horizontal camera pan
let vPan   = 0 // Vertical camera pan
let pan    = [] // Holds hPan and vPan
let bgc    = 35 // Background color
let tca    = [255, 69] // Text color and alpha (constant)
let ta     = 0   // Text alpha (dynamic, based on zoom)
let lineca = [120, 255] // Gridline color and alpha (constant)
let linea  = 255 // Gridline alpha (dynamic, based on zoom)
let linew  = 1   // Gridline width
let totColors = 30 // Palette size
let colorsPerRow = 15 // Colors per palette row
let row = 1 // Palette row index
let rC // Random color
let cPalette = [[-1, [222,  82,  82], [222,  82,  82], 0, 0], 
                [ 0, [bgc, bgc, bgc], [bgc, bgc, bgc], 0, 0],
                [ 1, [ 40, 200, 100], [ 40, 200, 100], 0, 0],
                [ 2, [ 62, 152, 218], [ 62, 152, 218], 0, 0],
                [ 3, [200, 200, 200], [200, 200, 200], 0, 0],
                [ 4, [177,  88,   6], [177,  88,   6], 0, 0],
                [ 5, [200, 200,  40], [200, 200,  40], 0, 0],
                [ 6, [187,  92, 180], [187,  92, 180], 0, 0],
                [ 7, [100, 100, 100], [100, 100, 100], 0, 0],] // Index based value-color array, [value, cPick, tempPick, buttonx, buttony] (position data set in setup)

// Interactivity
let prevx // Previous mouseX pos
let prevy // Previous mouseY pos
let uipx  = 30 // UI button length
let uibc  = 80 // UI button color
let uihc  = 200 // UI highlight color
let uipscl = 0.7 // Scale of palette buttons in relation to the rest of the buttons
let undoredo = true // Undo or Redo was used during the previous frame
let verbose = true // If true, prints m whenever a change is made to it
let clickButtonArray = [[0, 0, undo, undoButton],
                        [0, 0, redo, redoButton],
                        [0, 0, reCenter, reCenterButton],
                        [0, 0, enlargeMatrix, enlargeMatrixButton, 2],] // Holds all relevant clickable button data in the form [[button1xPos, button1yPos, button1function, button1drawFunction, functionArgs]](set in setup)
let cPick // Color picked from color wheel
let cHover // Color under pointer from color wheel
let cPicking = false // Currently picking a color using the color wheel
let cPickingIndex = null // Index (cPalette) of color being currently picked
let cSelectIndex = 1 // Index (cPalette) of currently selected color
let vMod = false // Currently modifying luminosity value on color wheel
let pxIndex // Index of current pixel while hovering over color wheel
let v = 0.8 // luminosity value
let cWx // Color wheel x pos (set in setup)
let cWy // Color wheel y pos (set in setup)
let cWd = uipx*4 // Color wheel diameter
let onGUI // Mouse pointer currently on GUI elements (palette, tools, etc.)



function preload() {
  cWheel = loadImage('colorWheel.png')
}



function setup() {
  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault()) // Prevent context menu popup on right click
  }
  
  w = constrain(windowWidth,  575, windowWidth)
  h = constrain(windowHeight, 500, windowHeight)
  noSmooth()
  createCanvas(w, h)
  for (let y = 0; y < mh; y++) {
    m[y] = []
    for (let x = 0; x < mw; x++) {
      m[y][x] = dv
    }
  }
  
  s    = pxwh*zoom
  mwpx = s*mw
  mhpx = s*mh
  hRef = (w-mwpx)/2
  vRef = (h-mhpx)/2
  hPan = 0
  vPan = 0
  
  i = 1
  for (let button of clickButtonArray) {
    button[0] = w-uipx/1.25
    button[1] = (i*2-1)*uipx/1.25
    i++
  }
  
  if (totColors > cPalette.length) {
    for (let i = cPalette[cPalette.length-1][0] + 1; i < totColors-1; i++) {
      rC = [random(255), random(255), random(255)]
      cPalette.push([i, [...rC], [...rC], 0, 0])
    }
  }
  
  i = 1
  for (let valCol of cPalette) {
    row = floor((i-1)/colorsPerRow)
    valCol[3] = (uipx/1.25-uipx/2)+(i*2-1 - row*2*colorsPerRow)*uipx/1.25*uipscl
    valCol[4] = (uipx/1.25-uipx/2)+(row*2+1)*uipx/1.25*uipscl // uipx/1.25
    i++
  }

  cWx = cWd/1.725 + uipx/5
  cWy = cWd/1.725 + (1.25+floor(totColors/colorsPerRow))*(uipscl*uipx + uipx/3)
  imageMode(CENTER)
  ellipseMode(CENTER)
  
  mHist.push([deepCopy2D(m), mw, mh, getCurrentPalette()])
}

  

function draw() {
  background(bgc)
  zoom = updateZoom(minZ, maxZ)
  s    = pxwh*zoom
  mwpx = s*mw
  mhpx = s*mh
  pan  = updatePan()
  hPan = pan[0]
  vPan = pan[1]
  hRef = (w-mwpx+s)/2 + hPan*zoom
  vRef = (h-mhpx+s)/2 + vPan*zoom
  
  zFac = constrain(zoom, 0, 1)
  la   = lineca[1] * zFac**1.5
  // ta   = tca[1] * zFac**2
  
  // Draw grid
  onGUI = false //mouseOnGUI()
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      
      xpx1 = hRef + x*s
      ypx1 = vRef + y*s
      xpx2 = xpx1 + s
      ypx2 = ypx1 + s
      stroke(lineca[0], la)
      strokeWeight(linew)
      fill(cPalette[m[y][x] + 1][2])
      rect(xpx1, ypx1, s, s)
      
      // fill(tca[0], ta)
      // noStroke()
      // textAlign(CENTER, CENTER);
      // textSize(s/1.5)
      // text(m[y][x], hRef + x*s+s/2, vRef + y*s+s/2)
      
      // Free drawing
      
      if (mouseIsPressed && mouseButton == LEFT) {
        if (!onGUI) {
          if (m[y][x] != cSelectIndex-1) {
            if (mouseX > xpx1 - s/2 && mouseX < xpx2 - s/2 && mouseY > ypx1 - s/2 && mouseY < ypx2 - s/2) {
              pxChange = true
              m[y][x] = cSelectIndex-1
            } 
          }
        }
      }
    }
  }
  
  // Draw GUI
  drawClickButtons()
  drawColorPalette()
  drawColorWheel()   // if (cPicking) {} is inside func
  updateHoverColor() // if (cPicking) {} is inside func
  
  prevx = mouseX
  prevy = mouseY
  
  if (frameCount == 1 || mod) {
    if (verbose) {
      console.log(showMatrix(m))
      // console.log(getCurrentPalette())
    } if (!undoredo) {
      cm++
      mHist = mHist.slice(0, cm)
      mHist.push([deepCopy2D(m), mw, mh, getCurrentPalette()])
    }
    mod      = false
    undoredo = false
    pxChange = false
  }
  
  // for (let matrix of mHist) {
  //   console.log(showMatrix(matrix[0]))
  // }
}
  

  
function showMatrix(m) {
  let rowText = ''
  let matrixText = '['
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      if (m[y][x] < 0) {
        rowText += ''+m[y][x]+','
      } else {
        rowText += ' '+m[y][x]+','
      }
    }
    if (y == 0) {
      matrixText += '['+rowText+'],'
    } else {
      matrixText +=' ['+rowText+'],'
    }
    if (y != mh-1) {
      matrixText += '\n'
    }
    rowText = ''
  }
  matrixText += ']'
  return matrixText
}
  
  
  
function updateZoom(min, max) {
  let zoomIn  = keyIsPressed && (key === '+')
  let zoomOut = keyIsPressed && (key === '-')
  if (zoomIn) {
    // zoom += 0.1
    zoom *= 1.025
  } else if (zoomOut) {
    // zoom -= 0.1
    zoom *= 0.975
  }

  if (mouseIsPressed) {
    if (mouseButton === CENTER) {
      zoom -= 2*zoom*(mouseY-prevy)/h
    }
  }
  
  zoom = constrain(zoom, min, max)
  return zoom
}



function updatePan() {
  let p = pxwh/2 
  let r = keyIsDown(RIGHT_ARROW)
  let l = keyIsDown(LEFT_ARROW)
  let u = keyIsDown(UP_ARROW)
  let d = keyIsDown(DOWN_ARROW)
  if (r) {
    hPan -= p
  } if (l) {
    hPan += p
  } if (u) {
    vPan += p
  } if (d) {
    vPan -= p
  }
  
  if (mouseIsPressed) {
    if (mouseButton === RIGHT) {
      hPan += (mouseX-prevx)/zoom
      vPan += (mouseY-prevy)/zoom
    }
  }
  
  return [hPan, vPan]
}



function reCenter() {
  hPan = 0
  vPan = 0
  zoom = 1.0
}



function enlargeMatrix(n) {
  let nmw = n*mw
  let nmh = n*mh
  let nm  = []
  for (let y = 0; y < nmh; y++) {
    nm[y] = []
    for (let x = 0; x < nmw; x++) {
      nm[y][x] = dv
    }
  }
  for (let y = 0; y < nmh; y+=n) {
    for (let x = 0; x < nmw; x+=n) {
      for (let ny = y; ny < y+n; ny++) {
        for (let nx = x; nx < x+n; nx++) {
          nm[ny][nx] = m[ceil(y/n)][ceil(x/n)]
        }
      }
    }
  }
  m = nm
  mw = nmw
  mh = nmh
  // reCenter()
  mod = true
}



function reShapeMatrix(nmw, nmh) {
  // m is reshaped from bottom-left to up-right
  let nm  = []
  let delta = nmh - mh
  for (let y = 0; y < nmh; y++) {
    nm[y] = []
    for (let x = 0; x < nmw; x++) {
      if (y-delta+1 > 0 && x < mw) {
        nm[y][x] = m[y-delta][x]
      } else {
        nm[y][x] = dv
      }
    }
  }
  m = nm
  mw = nmw
  mh = nmh
  // reCenter()
  mod = true
}



function undo() {
  if (cm > 0) {
    cm--
    nm = mHist[cm]
    m  = deepCopy2D(nm[0])
    mw = nm[1]
    mh = nm[2]
    p  = deepCopy2D(nm[3])
    setPalette(p)
    // reCenter()
    mod = true
    undoredo = true
  }
}



function redo() {
  if (cm < mHist.length-1) {
    cm++
    nm = mHist[cm]
    m  = deepCopy2D(nm[0])
    mw = nm[1]
    mh = nm[2]
    p  = deepCopy2D(nm[3])
    setPalette(p)
    // reCenter()
    mod = true
    undoredo = true
  }
}



function baseButton(x, y, color) {
  rectMode(CENTER)
  noStroke()
  fill(bgc/2)
  rect(x + uipx/10, y + uipx/10, uipx, uipx, uipx/10)
  fill(color)
  rect(x, y, uipx, uipx, uipx/10)
}



function reCenterButton(x, y) {
  baseButton(x, y, uibc)
  fill(uihc)
  ellipse(x, y, uipx*2.25/3)
  fill(uibc)
  ellipse(x, y, uipx*1.75/3)
  fill(uihc)
  ellipse(x, y, uipx*1/5)
}



function enlargeMatrixButton(x, y) {
  baseButton(x, y, uibc)
  noFill()
  strokeWeight(uipx/20)
  stroke(uihc, 150)
  rect(x-uipx*1/6, y-uipx*1/6, uipx*1/3)
  stroke(uihc)
  rect(x, y, uipx*2/3)
}



function undoButton(x, y) {
  baseButton(x, y, uibc)
  fill(uihc)
  ellipse(x, y, uipx*1.8/3)
  fill(uibc)
  ellipse(x, y, uipx*1.4/3)
  rect(x-uipx/4.5, y-uipx/4.5, uipx/2.25)
  fill(uihc)
  triangle(x, y-0.85*uipx/2.25, x, y-0.35*uipx/2.25, x-uipx/6, y-0.6*uipx/2.25)
}



function redoButton(x, y) {
  baseButton(x, y, uibc)
  fill(uihc)
  ellipse(x, y, uipx*1.8/3)
  fill(uibc)
  ellipse(x, y, uipx*1.4/3)
  rect(x+uipx/4.5, y-uipx/4.5, uipx/2.25)
  fill(uihc)
  triangle(x, y-0.85*uipx/2.25, x, y-0.35*uipx/2.25, x+uipx/6, y-0.6*uipx/2.25)
}



function drawClickButtons() {
  for (let button of clickButtonArray) {
    let bx = button[0]
    let by = button[1]
    let draw = button[3]
    draw(bx, by)
  }
}



function drawColorPalette() {
  let uipxrscld = uipx*uipscl
  for (let valCol of cPalette) {
    let val = valCol[0]
    let col = valCol[2]
    let bx  = valCol[3]
    let by  = valCol[4]
    let isSelected = cSelectIndex == val+1
    rectMode(CENTER)
    noStroke()
    if (isSelected) {
      fill(uihc)
      rect(bx, by, uipxrscld*1.15, uipxrscld*1.15, uipxrscld/10)
      rect(bx, by+uipxrscld*1.15/1.65, uipxrscld*1.15/2, uipxrscld/15, uipxrscld/15)
    } else {
      fill(bgc/2)
      rect(bx + uipx/10, by + uipx/10, uipxrscld, uipxrscld, uipxrscld/10)
    }
    fill(col)
    rect(bx, by, uipxrscld, uipxrscld, uipxrscld/10)
    if ((col[0] + col[1] + col[2])/3 < 80) {
      fill(255, 40)//+80*()
    } else {
      fill(0, 50)
    }
    rect(bx, by, uipxrscld, uipxrscld, uipxrscld/10)
    fill(col)
    rect(bx, by, uipxrscld/1.2, uipxrscld/1.2, uipxrscld/10)
    stroke(0, 100)
    strokeWeight(3)
    fill(255, 200)
    textAlign(CENTER, CENTER);
    textSize(uipxrscld/1.9)
    text(val, bx, by)
  }
}



function mouseClicked() {
  // Buttons
  for (let button of clickButtonArray) {
    let bx = button[0]
    let by = button[1]
    let func = button[2]
    let args = button[4]
    if (mouseX > bx - uipx/2 && mouseX < bx + uipx/2) {
      if (mouseY > by - uipx/2 && mouseY < by + uipx/2) {
        func(args)
      }
    }
  }
  
  // Colors
  // Wheel
  if (cPicking) {
    if (dist(mouseX, mouseY, cWx, cWy) < cWd/2) {
      pxIndex = (mouseY * width + mouseX) * pxd * 4
      loadPixels()
      cPick = [pixels[pxIndex],
               pixels[pxIndex + 1],
               pixels[pxIndex + 2],
               pixels[pxIndex + 3]]
      updatePixels()
      cPick = [cPick[0]*v, cPick[1]*v, cPick[2]*v]
      cPalette[cPickingIndex][1] = [...cPick]
      cPicking = false
      cPickingIndex = null
      mod = true
    } else if ((mouseX > cWx + cWd*1.15/2 || mouseX < cWx - cWd*1.15/2 || mouseY > cWy + cWd/8 + cWd*1.4/2 || mouseY < cWy + cWd/8 - cWd*1.4/2)) { // Click outside of color wheel window
      cPicking = false
      cPickingIndex = null
    }
  }
  // Palette
  for (let valCol of cPalette) {
    let bx = valCol[3]
    let by = valCol[4]
    let i  = valCol[0] + 1
    if (mouseX > bx - uipx/2 && mouseX < bx + uipx/2) {
      if (mouseY > by - uipx/2 && mouseY < by + uipx/2) {
        if (i == cSelectIndex) {
          cPickingIndex = i
          cPicking = true
        }
        cSelectIndex = i
      }
    }
  }
}



function deepCopy2D(a) {
  let copy = []
  for (let y = 0; y < a.length; y++) {
    copy[y] = [...a[y]]
  }
  return copy
}



function mouseReleased() {
  // Luminosity control
  vMod = false
  
  // Drawing
  if (pxChange) {
    mod = true
    pxChange = false
  }
}


function drawColorWheel() {
  if (cPicking) {
    noStroke()
    rectMode(CENTER)
    fill(bgc/2)
    rect(cWx + uipx/10, cWy + cWd/8 + uipx/10, cWd*1.15, cWd*1.4, cWd/8)
    fill(uibc-30)
    rect(cWx, cWy + cWd/8, cWd*1.15, cWd*1.4, cWd/8)
    rectMode(CORNER)
    fill(uihc)
    ellipse(cWx, cWy, cWd*21/20)
    tint(255*v)
    image(cWheel, cWx, cWy, cWd, cWd)
    fill(uihc-50)
    rect(cWx-cWd/2, cWy + cWd/1.55 - cWd/160, cWd*v, cWd/80, cWd/80)
    fill(uibc)
    rect(cWx-cWd/2+cWd*v, cWy + cWd/1.55 - cWd/160, cWd*(1-v), cWd/80, cWd/80)
    fill(uihc)
    ellipse(cWx-cWd/2+v*cWd, cWy + cWd/1.55, cWd/20)
    rectMode(CENTER)
    if (mouseIsPressed) {
      if (vMod || ((mouseX > cWx-cWd/2-cWd/40 && mouseX < cWx+cWd/2+cWd/40) && (mouseY > cWy + cWd/1.8 && mouseY < cWy + cWd/1.3))) {
        v = constrain(map(mouseX, cWx-cWd/2, cWx+cWd/2, 0, 1), 0, 1)
        vMod = true
      }
    }
  }
}



function updateHoverColor() {
  if (cPicking) {
    if (dist(mouseX, mouseY, cWx, cWy) < cWd/2) {
      pxIndex = (mouseY * width + mouseX) * pxd * 4
      loadPixels()
      cHover = [pixels[pxIndex],
                pixels[pxIndex + 1],
                pixels[pxIndex + 2],
                pixels[pxIndex + 3]]
      updatePixels()
      cHover = [cHover[0]*v, cHover[1]*v, cHover[2]*v]
      cPalette[cPickingIndex][2] = cHover
    } else {
      cPalette[cPickingIndex][2] = [...cPalette[cPickingIndex][1]]// reset color to cPick
    }
  } else if (cPickingIndex) {
    cPalette[cPickingIndex][2] = [...cPalette[cPickingIndex][1]] // reset color to cPick
  }
}



function getCurrentPalette() {
  p = []
  for (let valCol of cPalette) {
    p.push([...valCol[1]])
  }
  return p
}



function setPalette(p) {
  i = 0
  for (let col of p) {
    cPalette[i][1] = [...col]
    cPalette[i][2] = [...col]
    i++
  }
}



// function mouseOnGUI() {
//   let res = false
//   if (mouseIsPressed) {
//    
//   }
//   return res
// }





























