// Developed and tested on Firefox 98.0.2 for Manjaro Linux, running p5js 1.4.1
// To be implemented using PyGame

// Planned functionality: GUI for very easily creating and modifying 2D matrices
// Useful for creating 2D pixel art textures and for 2D game level design
// 2D matrices could be of any given size/dimensions
// To do list:
//   - highlight corresponding color in color palete when hovering on pixel (and/or inverse)
//   - line tool, toggleable tools selection panel on lower right, use line tool logic to fill gaps when free drawing
//   - cut tool (keep part of matrix)
//   - fill tool (change all neighboring pixels of same value at once)
//   - rect tool, circle tool
//   - select -> copy/cut -> move tool
//   - save as png, copy matrix to clipboard, copy matrix to clipboard numpy mode buttons
//   - better GUI feedback on hover and button press
//   - replace color wheel png by a shader precomputed in setup
//   - hue shifting, somehow
// PyGame to do list:
//   - Make each pixel 4 triangles so diagonals are allowed (no longer pixel art though)
//   - automatically place randomized textures according to matrix values

// Preloaded data
let loadM = []
let loadC = []
// loadM = [
// [  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  0,  1,  0,  1,  0,  0,  1,  1,  0,  0,  0,  1,  0,  0,  1, 17,  1,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  1, 17,  1,  0,  0,  1,  0,  0,  0,  1, 17,  1,  0,  1, 17,  1,  0,  1,  1,  1,  0,  1, 17,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  1,  0,  0,  0,  0,  1,  1,  1,  0,  1,  0,  1,  0,  1,  0,  1,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  0,  0,  0,  0,  1,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  2,  2,  2,  6,  1,  0,  0,  1,  2,  2,  2,  6,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  6,  2,  1,  1,  6,  6,  1,  1,  6,  2,  1,  1,  6,  6,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  6,  2,  1, 22, 22,  1,  6,  6,  6,  2,  1, 22, 22,  1,  6,  6,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  6,  1, 22, 22, 22, 22,  1,  6,  6,  1, 22, 22, 22, 22,  1,  6,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  6,  1, 22, 22, 22, 22,  1,  6,  6,  1, 22, 22, 22, 22,  1,  6,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  6,  6,  1, 14, 22,  1, 22,  1,  8,  8,  1, 22,  1, 22, 14,  1,  6,  6,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  2,  6,  1, 14, 22,  1, 14,  1,  7,  7,  1, 14,  1, 22, 14,  1,  2,  6,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  2,  2,  6,  8,  1, 14, 14,  1,  1,  1,  1,  1,  1, 14, 14,  1,  8,  2,  6,  6,  1,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  2,  6,  6,  6,  8,  1,  1,  6,  2,  2,  2,  2,  6,  1,  1,  8,  6,  6,  2,  6,  1,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  6,  6,  6,  6,  1,  6,  2,  2,  6,  6,  6,  2,  2,  6,  6,  1,  6,  6,  6,  6,  1,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  8,  6,  6,  1,  6,  6,  2,  7,  8,  6,  2,  7,  8,  6,  6,  6,  1,  6,  6,  8,  1,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  8,  8,  1,  8,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  8,  1,  8,  8,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  8,  1,  8,  8,  8,  6,  6,  6,  6,  6,  6,  8,  8,  8,  1,  8,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  7,  1,  1,  8,  8,  8,  8,  8,  8,  8,  8,  1,  1,  7,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  7, 13, 13, 13, 19,  7,  7,  7,  7, 19, 13, 13, 13,  7,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 13, 13, 14, 17, 18, 13, 13, 13, 13, 18, 17, 14, 13, 13,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1, 14, 14, 15, 18, 17, 14, 14, 17, 18, 16, 14, 14, 13,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  1,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0, 13, 14, 15, 15, 15, 17, 15, 15, 17, 16, 17, 16, 14,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  1,  2,  2,  2,  2,  1,  1,  0,  0,  0,  0,  0,  0, 13, 14, 17, 15, 17, 17, 17, 17, 17, 17, 16, 17, 14, 13,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  1,  1,  6,  6,  2,  2,  1,  1,  0,  0,  0,  0, 13, 13, 17, 17, 17, 13, 13, 13, 13, 17, 17, 17, 13, 13,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  1,  6,  6,  2,  2,  2,  1,  0,  0,  0,  0, 13, 13, 13, 13, 13,  7,  7, 13, 13, 13, 13, 13,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  1,  8,  6,  6,  2,  2,  1,  0,  0,  0,  0,  0,  1,  8,  8,  8,  8,  8,  8,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  1,  8,  6,  6,  2,  2,  1,  0,  0,  0,  0,  1,  1,  6,  6,  6,  6,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  1,  8,  8,  6,  6,  2,  1,  0,  0,  0,  1,  1,  1,  6,  6,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  1, 21, 21,  8,  6,  8,  1,  0,  1,  1,  7,  1,  1,  1,  1, 20,  1,  0,  0,  0,  0,  0,  1,  1,  6,  6,  6,  6,  1,  1,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  6,  8, 21, 21,  7,  7,  7,  1,  1,  1,  1,  0,  1,  6,  6,  2,  2,  2,  6,  6,  8,  1,  0,],
// [  0,  0,  0,  0,  0,  1,  1,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  8,  8,  8,  7,  1,  5,  5,  1,  1,  6,  2,  2,  6,  6,  6,  2,  6,  8,  1,  0,],
// [  0,  0,  0,  0,  0,  1,  6,  6,  2,  2,  2,  2,  2,  2,  2,  2,  6,  2,  6,  6,  6,  8,  7,  1,  5,  9,  9,  1,  6,  6,  6,  6,  6,  6,  6,  6,  6,  8,  1,],
// [  0,  0,  0,  0,  1,  1,  6,  2,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  8,  7,  1,  5,  9,  4,  1,  1,  8,  6,  6,  6,  6,  6,  6,  6,  8,  1,],
// [  0,  0,  0,  0,  1,  6,  6,  2,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  8,  7,  1,  5,  9,  4,  4,  1, 21,  8,  8,  6,  6,  6,  2,  6,  8,  1,],
// [  0,  0,  0,  0,  1,  6,  2,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  8,  7,  1,  5,  9,  4,  4,  1, 20,  1,  1,  8,  6,  6,  6,  6,  8,  1,],
// [  0,  0,  0,  0,  1,  6,  6,  6,  6,  8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  7,  7,  1,  5,  9,  4,  4,  1, 20,  7, 21,  1,  6,  6,  2,  6,  8,  1,],
// [  0,  0,  0,  0,  1,  6,  6,  6,  8,  7,  7,  7,  7,  7,  7,  7,  7,  7,  7,  7,  7,  7,  1,  1,  5,  9,  4,  4,  1, 21,  8,  8,  1,  6,  6,  6,  6,  8,  1,],
// [  0,  0,  0,  0,  1,  6,  6,  8,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  5,  9,  4,  4,  4,  1,  8,  8,  6, 21,  6,  2,  6,  8, 21,  1,],
// [  0,  0,  0,  0,  1,  6,  6,  8,  7,  1,  1,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  9,  4,  4,  4,  4,  1,  8,  6,  6,  8,  6,  6,  6,  8, 21,  1,],
// [  0,  0,  0,  0,  1,  6,  6,  8,  7,  1,  5,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  4,  4, 10,  4,  4,  1,  8,  6,  6,  6,  6,  6,  8, 21,  1,  0,],
// [  0,  0,  0,  0,  1,  6,  6,  8,  7,  1,  9,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4, 10,  4,  4,  4,  1,  8,  8,  6,  6,  6,  8, 21, 21,  1,  0,],
// [  0,  0,  0,  0,  1,  6,  6,  8,  7,  1,  4,  4, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,  4,  4,  4,  4,  1, 21,  8,  8,  8, 21,  7,  1,  1,  0,  0,],
// [  0,  0,  0,  0,  1,  1,  6,  8,  7,  1,  4, 10,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  1,  1, 21, 21, 21,  7,  1,  1,  1,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  1,  8,  8,  7,  1,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  1, 20,  7,  7,  1,  1,  1,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  1,  1,  7,  7,  1,  4, 10,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  1,  1,  1,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  4,  4,  4,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  4, 10,  4,  4,  4,  4,  5,  5,  5,  5,  5,  5,  5,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  4,  4, 10,  4,  4,  4,  9,  9,  5,  9,  9,  9,  9,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  4,  4,  4,  4,  4,  4,  9,  3,  9,  4,  4,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  4,  4,  4,  4,  9,  9,  9,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],
// [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,],]
// loadC = [
// [  0, [ 255, 249, 249,]],
// [  1, [   0,   0,   0,]],
// [  2, [ 255, 236,  84,]],
// [  3, [ 180, 255, 251,]],
// [  4, [  69, 128, 216,]],
// [  5, [  61,  70, 231,]],
// [  6, [ 216, 199,  31,]],
// [  7, [ 161,  54,   8,]],
// [  8, [ 216, 139,  96,]],
// [  9, [  48, 111, 231,]],
// [ 10, [ 113, 146, 231,]],
// [ 13, [  19,  19,  19,]],
// [ 14, [ 202, 208, 208,]],
// [ 15, [   4,   6,  22,]],
// [ 16, [ 232,  24,  10,]],
// [ 17, [ 164, 166, 164,]],
// [ 18, [ 254, 249, 242,]],
// [ 19, [ 120,  73,   5,]],
// [ 20, [ 120,   5,  10,]],
// [ 21, [ 168,  86,  79,]],
// [ 22, [ 243, 254, 238,]],] 

// Global variables
// Inner logic
p5.disableFriendlyErrors = true
let m     = [] // Matrix
let mw    = 16 // Matrix width
let mh    = 16 // Matrix height
let dv    = 0 // Default matrix value
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
let lineca = [120, 255] // Gridline color and alpha (constant)
let linea  = 255 // Gridline alpha (dynamic, based on zoom)
let linew  = 1   // Gridline width
let totColors = 30 // Palette size
let colorsPerRow = 15 // Colors per palette row
let cPaletteRows // Number of rows on color palette
let row // Palette row index
let rC // Random color
let nNeg = 1 // Number of negative values, must be at least 1 and at most totColors - 1 (constrained in setup)
let cPaletteFixed = [[-1, [222,  82,  82], [222,  82,  82], 0, 0],
                     [ 0, [bgc, bgc, bgc], [bgc, bgc, bgc], 0, 0],
                     [ 1, [ 40, 200, 100], [ 40, 200, 100], 0, 0],
                     [ 2, [ 62, 152, 218], [ 62, 152, 218], 0, 0],
                     [ 3, [200, 200, 200], [200, 200, 200], 0, 0],
                     [ 4, [177,  88,   6], [177,  88,   6], 0, 0],
                     [ 5, [200, 200,  40], [200, 200,  40], 0, 0],
                     [ 6, [187,  92, 180], [187,  92, 180], 0, 0],
                     [ 7, [100, 100, 100], [100, 100, 100], 0, 0],] // Index based value-color array, [value, cPick, tempPick, buttonx, buttony] (value and position data set in setup)
let nFixedColors = cPaletteFixed.length // Number of preselected colors
let cPalette = [] // Holds all color palette data

// Interactivity
let uipx  = 30 // UI button length
let uibc  = 80 // UI button color
let uihc  = 200 // UI highlight color
let uipscl = 0.7 // Scale of palette buttons in relation to the rest of the buttons
let uipxpscl = uipx*uipscl // Palette button length
let undoredo = true // Undo or Redo was used during the previous frame
let verbose = true // If true, prints m whenever a change is made to it
let clickButtonArray = [[0, 0, undo, undoButton, null, 'undo'],
                        [0, 0, redo, redoButton, null, 'redo'],
                        [0, 0, reCenter, reCenterButton, null, 'recenter'],
                        [0, 0, upScale, upScaleButton, 2, 'upscale'],] // Holds all relevant clickable button data in the form [[button1xPos, button1yPos, button1function, button1drawFunction, button1functionArgs, name]] (set in setup)
let nClickButtons = clickButtonArray.length // Number of clickable buttons
let undoAble = false // Ctrl key is being held down
let redoAble = false // Ctrl+shift key is being held down
let cPick // Color picked from color wheel
let cHover // Color under pointer from color wheel
let cPicking = false // Currently picking a color using the color wheel
let cPickedHolding = false // cPicking just turned false because of mouse press, currently holding down mouse button
let clickedOnColor = false // On mouse click, some color from the palette was clicked
let cPickingIndex = null // Index (cPalette) of color being currently picked
let cSelectIndex // Index (cPalette) of currently selected color (set in setup, defaults to 1 if possible)
let vMod = false // Currently modifying luminosity value on color wheel
let pxIndex // Index of current pixel while hovering over color wheel
let v = 0.8 // Luminosity value
let cWx // Color wheel x pos (set in setup)
let cWy // Color wheel y pos (set in setup)
let cWd = uipx*4 // Color wheel diameter
let onGUI // Mouse pointer currently on GUI elements (palette, tools, etc.)
let cPalettew
let cPaletteh
let clickButtonsw
let clickButtonsh
let cWheelw
let cWheelh // Size (width and height) of GUI element (set in setup)
let onPalette
let onClickButtons
let onWheel 
let onHelp // Mouse currently on top of GUI element (set in mouseOnGUI())
let mouseIndex // Holds output from mousePosToMatrixIndex()
let helping = false // Currently showing help overlay
let helped = false // Was showing help overlay on previous frame
let helpbx // Help button x pos (set in setup)
let helpby // Help button y pos (set in setup)



function preload() {
  cWheel = loadImage('colorWheel.png')
}



function setup() {
  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault()) // Prevent context menu popup on right click
  }
  
  w = constrain(windowWidth,  666, windowWidth)
  h = constrain(windowHeight, 500, windowHeight)
  smooth()
  createCanvas(w, h)
  for (let y = 0; y < mh; y++) {
    m[y] = []
    for (let x = 0; x < mw; x++) {
      m[y][x] = dv
    }
  }
  
  // Load matrix
  loadMatrix()
  
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
  
  nNeg = constrain(nNeg, 1, totColors - 1)
  cSelectIndex = constrain(nNeg+1, nNeg, totColors-1)
  for (let i = -nNeg; i < totColors - nNeg; i++) {
    if (i < -1 || i > nFixedColors - 2) {
      rC = [random(255), random(255), random(255)]
      cPalette.push([i, [...rC], [...rC], 0, 0])
    } else {
      cPalette.push([i, [...cPaletteFixed[i+1][1]], [...cPaletteFixed[i+1][2]], 0, 0])
    }
  }
  
  i = 1
  for (let valCol of cPalette) {
    row = floor((i-1)/colorsPerRow)
    valCol[3] = (uipx/1.25-uipx/2+uipx/2*uipscl)+(i*2-2 - row*2*colorsPerRow)*uipx/1.25*uipscl
    valCol[4] = (uipx/1.25-uipx/2+uipx/2*uipscl)+(row*2)*uipx/1.25*uipscl
    i++
  }

  // Load color palette
  loadColors()
  
  cPaletteRows = floor(totColors/colorsPerRow)
  cPalettew = (uipx/1.25-uipx/2)+(colorsPerRow)*2*(uipx/1.25)*uipscl - (uipx/1.25-uipx/2)*uipscl
  cPaletteh = (uipx/1.25-uipx/2)+(cPaletteRows)*2*(uipx/1.25)*uipscl
  clickButtonsw = 2*uipx/1.25
  clickButtonsh = nClickButtons*2*uipx/1.25
  cWheelw = cWd/8 + cWd*1.15
  cWheelh = cWd*1.4
  cWx = cWd/1.725 + uipx/5
  cWy = cWd/1.725 + cPaletteh
  helpbx = uipx/1.25-uipx/2+uipx/2*0.7
  helpby = h - uipx/1.25+uipx/2-uipx/2*0.7
  
  imageMode(CENTER)
  ellipseMode(CENTER)
  rectMode(CENTER)
  
  mHist.push([deepCopy2D(m), mw, mh, getCurrentPalette()])
}

  

function draw() {
  background(bgc)
  keyboardShortcuts()
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
  
  // Draw grid
  mouseOnGUI()
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      xpx1 = hRef + x*s
      ypx1 = vRef + y*s
      xpx2 = xpx1 + s
      ypx2 = ypx1 + s
      stroke(lineca[0], la)
      strokeWeight(linew)
      fill(cPalette[m[y][x] + nNeg][2])
      rect(xpx1, ypx1, s, s)
    }
  }
  // Drawing tools
  freeDraw()
  
  // GUI display and interaction (except for mouseClicked, mouseReleased and keyboard shortcuts)
  drawClickButtons()
  drawColorPalette()
  mouseHeldInteractions()
  drawColorWheel()
  updateHoverColor()
  showHelp()
  
  // Console log
  if (frameCount == 1 || mod) {
    if (verbose) {
      console.log(showMatrix(m, type = null)+'\n'+showColors(getCurrentPalette()))
    } if (!undoredo) {
      cm++
      mHist = mHist.slice(0, cm)
      mHist.push([deepCopy2D(m), mw, mh, getCurrentPalette()])
    }
    mod      = false
    undoredo = false
    pxChange = false
  }
  // GUIdebug()
  // gridDebug()
}
  

  
function showMatrix(m, type = null) {
  let rowText = ''
  let matrixText = 'loadM = [\n'
  if (type == 'np') {
     matrixText = 'loadM = np.array([\n'
  }
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[0].length; x++) {
      if (m[y][x] < 0 || m[y][x] > 9) {
        rowText += ' '+m[y][x]+','
      } else {
        rowText += '  '+m[y][x]+','
      }
    }
    if (type == 'np') {
      matrixText += 'np.array(['+rowText+']),'
    } else {
      matrixText += '['+rowText+'],'
    }
    if (y != m.length-1) {
      matrixText += '\n'
    }
    rowText = ''
  }
  matrixText += ']'
  if (type == 'np') {
     matrixText += ')'
  }
  return matrixText
}
  
  
function showColors() {
  let colorsText = 'loadC = [\n'
  for (let colNum of Array.from({length: totColors}, (x, i) => i - nNeg)) {
    if (isIn2Darray(colNum, m)) {
      for (let currentC of cPalette) {
        if (currentC[0] == colNum) {
          let rowText = ''
          if (colNum > -1 && colNum < 10) {
            rowText += '[  ' +colNum+', ['
          } else {
            rowText += '[ '+colNum+', ['
          }
          for (let colRGB of currentC[2]) {
            rowText += ' '.repeat(3 - int(colRGB>=10) - int(colRGB>=100))+round(colRGB) +','
          }
          rowText += ']],\n'
          colorsText += rowText
        }
      }
    }
  }
  colorsText = colorsText.slice(0,colorsText.length-1)+']'
  return colorsText
}


  
function updateZoom(min, max) {
  let zoomIn  = keyIsPressed && (key === '+')
  let zoomOut = keyIsPressed && (key === '-')
  if (zoomIn) {
    zoom *= 1.025
  } else if (zoomOut) {
    zoom *= 0.975
  }

  if (mouseIsPressed) {
    if (mouseButton === CENTER) {
      zoom -= 2*zoom*(mouseY-pmouseY)/h
    }
  }
  
  if (zoomIn || zoomOut){
    helping = false
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
      hPan += (mouseX-pmouseX)/zoom
      vPan += (mouseY-pmouseY)/zoom
    }
  }
  
  if (r || l || u || d){
    helping = false
  }
  
  return [hPan, vPan]
}



function reCenter() {
  hPan = 0
  vPan = 0
  zoom = 1.0
}



function upScale(n) {
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
    mod = true
    undoredo = true
  }
}



function baseButton(x, y, color) {
  rectMode(CENTER)
  noStroke()
  fill(color)
  rect(x, y, uipx, uipx, uipx/10)
}



function reCenterButton(x, y) {
  fill(bgc/2)
  noStroke()
  rect(x + uipx/10, y + uipx/10, uipx, uipx, uipx/10)
  baseButton(x, y, uibc)
  fill(uihc)
  ellipse(x, y, uipx*2.25/3)
  fill(uibc)
  ellipse(x, y, uipx*1.75/3)
  fill(uihc)
  ellipse(x, y, uipx*1/5)
}



function upScaleButton(x, y) {
  fill(bgc/2)
  noStroke()
  rect(x + uipx/10, y + uipx/10, uipx, uipx, uipx/10)
  baseButton(x, y, uibc)
  noFill()
  strokeWeight(uipx/20)
  stroke(uihc, 150)
  rect(x-uipx*1/6, y-uipx*1/6, uipx*1/3)
  stroke(uihc)
  rect(x, y, uipx*2/3)
}



function undoButton(x, y) {
  fill(bgc/2)
  noStroke()
  rect(x + uipx/10, y + uipx/10, uipx, uipx, uipx/10)
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
  fill(bgc/2)
  noStroke()
  rect(x + uipx/10, y + uipx/10, uipx, uipx, uipx/10)
  baseButton(x, y, uibc)
  fill(uihc)
  ellipse(x, y, uipx*1.8/3)
  fill(uibc)
  ellipse(x, y, uipx*1.4/3)
  rect(x+uipx/4.5, y-uipx/4.5, uipx/2.25)
  fill(uihc)
  triangle(x, y-0.85*uipx/2.25, x, y-0.35*uipx/2.25, x+uipx/6, y-0.6*uipx/2.25)
}



function helpButton(x, y) {
  fill(bgc/2)
  noStroke()
  rect(x + uipx/10, y + uipx/10, uipx*0.7, uipx*0.7, uipx/10)
  rectMode(CENTER)
  noStroke()
  fill(uibc)
  rect(x, y, uipx*0.7, uipx*0.7, uipx/10)
  fill(uihc)
  textAlign(CENTER, CENTER)
  textSize(uipx*0.7/1.25)
  stroke(bgc/2, 150)
  strokeWeight(uipx/10)
  textFont('Georgia')
  text('i', x, y+uipx/20)
}



function drawClickButtons() {
  for (let button of clickButtonArray) {
    let bx = button[0]
    let by = button[1]
    let draw = button[3]
    draw(bx, by)
  }
  helpButton(helpbx, helpby)
}



function drawColorPalette() {
  for (let valCol of cPalette) {
    let val = valCol[0]
    let col = valCol[2]
    let bx  = valCol[3]
    let by  = valCol[4]
    let isSelected = cSelectIndex == val + nNeg
    rectMode(CENTER)
    if (isSelected) {
      stroke(bgc)
      strokeWeight(uipxpscl/15)
      fill(uihc)
      rect(bx, by, uipxpscl*1.3, uipxpscl*1.3, uipxpscl/6)
      rect(bx, by+uipxpscl*1.4/1.65, uipxpscl*1.15/1.8, uipxpscl/6, uipxpscl/15)
    } else {
      noStroke()
      fill(bgc/2)
      rect(bx + uipx/10, by + uipx/10, uipxpscl, uipxpscl, uipxpscl/10)
    }
    noStroke()
    fill(col)
    rect(bx, by, uipxpscl, uipxpscl, uipxpscl/10)
    if ((col[0] + col[1] + col[2])/3 < 60) {
      fill(255, 50)//+80*()
    } else {
      fill(0, 50)
    }
    rect(bx, by, uipxpscl, uipxpscl, uipxpscl/10)
    fill(col)
    rect(bx, by, uipxpscl/1.2, uipxpscl/1.2, uipxpscl/10)
    stroke(0, 100)
    strokeWeight(2.5)
    fill(255, 150)
    textAlign(CENTER, CENTER)
    textFont('sans-serif')
    textSize(uipxpscl/1.9)
    text(val, bx, by)
  }
}



function showHelp() {
  if (helping) {
    background(bgc, 100)
    textFont('helvetica')
    textAlign(CENTER, CENTER)
    fill(uihc-50)
    stroke(uibc-50)
    strokeWeight(3)
    
    rect(w/2, h/2, 50, 80, 30)
    // fill(10,255,230)
    // fill(cPalette[cSelectIndex][2])
    fill(uihc+20)
    rect(w/2-12.5, h/2-20, 25, 40, 5)
    fill(uihc-50)
    rect(w/2+12.5, h/2-20, 25, 40, 5)
    rect(w/2, h/2-10, 7, 20, 7)

    rect(w/2-100, h/2-55, 17, 17, 5)
    rect(w/2-100-17, h/2-55, 17, 17, 5)
    rect(w/2-100+17, h/2-55, 17, 17, 5)
    rect(w/2-100, h/2-72, 17, 17, 5)
    fill(bgc/2)
    triangle(w/2-100+0.25, h/2-55, w/2-100-0.25, h/2-55, w/2-100, h/2-55+0.35)
    triangle(w/2-100+0.25, h/2-72, w/2-100-0.25, h/2-72, w/2-100, h/2-72-0.35)
    triangle(w/2-100-17, h/2-55+0.25, w/2-100-17, h/2-55-0.25, w/2-100-17-0.35, h/2-55)
    triangle(w/2-100+17, h/2-55+0.25, w/2-100+17, h/2-55-0.25, w/2-100+17+0.35, h/2-55)
    fill(uihc-50)
    rect(w/2-100, h/2, 50, 80, 30)
    rect(w/2-100-12.5, h/2-20, 25, 40, 5)
    // fill(10,255,230)
    // fill(cPalette[cSelectIndex][2])
    fill(uihc+20)
    rect(w/2-100+12.5, h/2-20, 25, 40, 5)
    fill(uihc-50)
    rect(w/2-100, h/2-10, 7, 20, 7)
    
    rect(w/2+100-14, h/2-57, 22, 22, 5)
    rect(w/2+100+14, h/2-57, 22, 22, 5)
    fill(bgc/2)
    noStroke()
    textSize(20)
    textStyle(BOLD)
    text('+', w/2+100-14, h/2-57)
    text('-', w/2+100+14, h/2-57)
    stroke(uibc-50)
    fill(uihc-50)
    rect(w/2+100, h/2, 50, 80, 30)
    rect(w/2+100-12.5, h/2-20, 25, 40, 5)
    rect(w/2+100+12.5, h/2-20, 25, 40, 5)
    // fill(10,255,230)
    // fill(cPalette[cSelectIndex][2])
    fill(uihc+20)
    rect(w/2+100, h/2-10, 7, 20, 7)
    fill(uihc-50)
    
    textStyle(BOLDITALIC)
    textSize(25)
    fill(uihc)
    text('pan', w/2-100, h/2+60)
    text('draw', w/2, h/2+60)
    text('zoom', w/2+100, h/2+60)
    textSize(20)
    textAlign(LEFT)
    text('color palette', helpbx-uipx*0.35, cPaletteh+10)
    textSize(15)
    textStyle(ITALIC)
    fill(uihc-50)
    text('click on a color once to select it, twice to modify it', helpbx-uipx*0.35, cPaletteh+30) 
    textAlign(CENTER, CENTER)
    text('github.com/TomoBossi/ArMatrix', w/2, h-15)
    textAlign(RIGHT)
    textStyle(NORMAL)
    textSize(11)
    text('ctrl + z', w-2*uipx/1.25, clickButtonArray[0][1]+uipx/2.6)
    text('ctrl + shift + z', w-2*uipx/1.25, clickButtonArray[1][1]+uipx/2.6)
    text('c', w-2*uipx/1.25, clickButtonArray[2][1]+uipx/2.6)
    textStyle(BOLDITALIC)
    textSize(15)
    fill(uihc)
    text(clickButtonArray[0][5], w-2*uipx/1.25, clickButtonArray[0][1])
    text(clickButtonArray[1][5], w-2*uipx/1.25, clickButtonArray[1][1])
    text(clickButtonArray[2][5], w-2*uipx/1.25, clickButtonArray[2][1])
    text(clickButtonArray[3][5], w-2*uipx/1.25, clickButtonArray[3][1])
    textStyle(NORMAL)
    textAlign(CENTER, CENTER)
  }
}



function mouseClicked() {
  // Clickable Buttons (upper right)
  for (let button of clickButtonArray) {
    let bx = button[0]
    let by = button[1]
    let func = button[2]
    let args = button[4]
    if (mouseX > bx - uipx/2 && mouseX < bx + uipx/2 && mouseY > by - uipx/2 && mouseY < by + uipx/2) {
      func(args)
    }
  }
  // Help button
  if (helping) {
    helping = false
    helped = true
  }
  if (!helped && mouseX > helpbx - uipx/2*0.7 && mouseX < helpbx + uipx/2*0.7 && mouseY > helpby - uipx/2*0.7 && mouseY < helpby + uipx/2*0.7) {
    helping = true
  } helped = false
  
  
  // Colors
  // Palette
  clickedOnColor = false
  for (let valCol of cPalette) {
    let bx = valCol[3]
    let by = valCol[4]
    let i  = valCol[0] + nNeg
    if (mouseX > bx - uipxpscl/2 && mouseX < bx + uipxpscl/2 && mouseY > by - uipxpscl/2 && mouseY < by + uipxpscl/2) {
      clickedOnColor = true
      if (i == cSelectIndex) {
        if (!cPicking) {
          if (!cPickedHolding) {
            cPickingIndex = i
            cPicking = true
          } else {
            cPickingIndex = null
            cPicking = false        
            cPickedHolding = false
          }
        } else {
          cPickingIndex = null
          cPicking = false
        }         
      } else {
        cPickedHolding = false
        cPickingIndex = null
        cPicking = false
        cSelectIndex = i
      }
    }
  } if (!clickedOnColor) {
      cPickedHolding = false
  }
  // Wheel
  if (cPicking) {
    if (dist(mouseX, mouseY, cWx, cWy) < cWd/2-1) {
      pxIndex = (mouseY * w + mouseX) * pxd * 4
      loadPixels()
      cPick = [pixels[pxIndex],
               pixels[pxIndex + 1],
               pixels[pxIndex + 2],
               pixels[pxIndex + 3]]
      updatePixels()
      cPick = [cPick[0]*v, cPick[1]*v, cPick[2]*v]
      cPalette[cPickingIndex][1] = [...cPick]
      cPickingIndex = null
      cPicking = false
      mod = true
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
  // Color wheel luminosity
  if (vMod) {
    vMod = false
  }
  
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
    tint(255*v)
    image(cWheel, cWx, cWy, cWd, cWd)
    noFill()
    stroke(uihc)
    strokeWeight(2)
    ellipse(cWx, cWy, cWd)
    noStroke()
    fill(uihc-50)
    rect(cWx-cWd/2, cWy + cWd/1.55 - cWd/160, cWd*v, cWd/80, cWd/80)
    fill(uibc)
    rect(cWx-cWd/2+cWd*v, cWy + cWd/1.55 - cWd/160, cWd*(1-v), cWd/80, cWd/80)
    fill(uihc)
    ellipse(cWx-cWd/2+v*cWd, cWy + cWd/1.55, cWd/20)
    rectMode(CENTER)
  }
}



function updateHoverColor() {
  if (cPicking) {
    if (dist(mouseX, mouseY, cWx, cWy) < cWd/2-1) {
      pxIndex = (mouseY * w + mouseX) * pxd * 4
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



function keyboardShortcuts() {
  // https://www.toptal.com/developers/keycode
  if (keyIsDown(17)) {
    undoAble = true
    redoAble = false
  } else {
    undoAble = false
  } if (keyIsDown(17) && keyIsDown(16)) {
    undoAble = false    
    redoAble = true
  } else {
    redoAble = false
  }
} function keyPressed() {
  if (keyCode === 90) {
    if (undoAble) {
      undo()
      helping = false
    } 
    if (redoAble) {
      redo()
      helping = false
    }
  } if (keyCode === 67) {
    reCenter()
    helping = false
  } for (let i = 48; i <= 57; i++) {
    if (keyCode === i) {
      cPicking = false
      cSelectIndex  = i-48+nNeg
    }
  }
}



function mouseOnGUI() {
  onGUI = false
  onPalette      = mouseX < cPalettew && mouseY < cPaletteh
  onClickButtons = mouseX > (w - clickButtonsw) && mouseY < clickButtonsh 
  onWheel        = mouseX < cWheelw && mouseY < cPaletteh + cWheelh && mouseY > cPaletteh
  onHelp         = mouseX < helpbx*2 && mouseY > 2*helpby - h
  if (mouseIsPressed) {
    if (onPalette || onClickButtons || (cPicking && onWheel) || onHelp || vMod) {
      onGUI = true
    }
  }
}



function GUIdebug() {
  fill(255, 30)
  stroke(0, 100)
  strokeWeight(2)
  rectMode(CORNER)
  
  // cPalette
  rect(0, 0, cPalettew, cPaletteh)
  
  // Tools (upper right)
  rect(w - clickButtonsw, 0, clickButtonsw, clickButtonsh)
  
  // Color wheel
  if (cPicking) {
    rect(0, cPaletteh, cWheelw, cWheelh)
  }
  
  // Help
  rect(0, 2*helpby - h, 2*helpbx, 2*helpby)
  rectMode(CENTER)
}



function gridDebug() {
  fill(200)
  stroke(0, 100)
  strokeWeight(2)
  ellipse(hRef - s/2,          vRef - s/2,          10, 10) 
  ellipse(hRef - s/2,          vRef - s/2 + s*mh,   10, 10)
  ellipse(hRef - s/2 + s*mw,   vRef - s/2,          10, 10)
  ellipse(hRef - s/2 + s*mw,   vRef - s/2 + s*mh,   10, 10) 
}



function mousePosToMatrixIndex() {
  x = floor((constrain(mouseX, hRef - s/2 - 1, hRef - s/2 + s*mw + 1) - (hRef - s/2))/s)
  y = floor((constrain(mouseY, vRef - s/2 - 1, vRef - s/2 + s*mh + 1) - (vRef - s/2))/s)
  // console.log(x, y, x >= 0 && x < mw && y >= 0 && y < mh)
  return [x, y, x >= 0 && x < mw && y >= 0 && y < mh]
}



function mouseHeldInteractions() {
  // Wheel
  if (cPicking && mouseIsPressed && mouseButton == LEFT) {
    if (vMod || ((mouseX > cWx-cWd/2-cWd/40 && mouseX < cWx+cWd/2+cWd/40) && (mouseY > cWy + cWd/1.8 && mouseY < cWy + cWd/1.3))) {
      v = constrain(map(mouseX, cWx-cWd/2, cWx+cWd/2, 0, 1), 0, 1)
      vMod = true
    } else if (!vMod) {
      if (!onWheel) {
        cPicking = false
        cPickingIndex = null
        cPickedHolding = true
      }
    }
  }
  // Help
  if (!onGUI && mouseIsPressed && (mouseButton == LEFT || mouseButton == RIGHT || mouseButton == CENTER)) {
    helping = false
  }
}



function freeDraw() {
  if (mouseIsPressed && mouseButton == LEFT) {
    mouseIndex = mousePosToMatrixIndex()
    x = mouseIndex[0]
    y = mouseIndex[1]
    if (mouseIndex[2]) { // Mouse pointer is on top of grid
      if (!onGUI) {
        helping = false
        if (m[y][x] != cSelectIndex - nNeg) {
          pxChange = true
          m[y][x] = cSelectIndex - nNeg
        }
      }
    }
  }
}



function isIn2Darray(elem, array) {
  for (let y = 0; y < array.length; y++) {
    for (let x = 0; x < array[0].length; x++) {
      if (array[y][x] == elem) {
        return true
      }
    }
  }
  return false
}



function loadMatrix() {
  if (loadM.length) {
    m = loadM
    mw = m[0].length 
    mh = m.length
  }
}



function loadColors() {
  if (loadC.length) {
    for (let c of loadC) {
      loadColNum = c[0]
      loadCol    = c[1]
      for (let currentC of cPalette) {
        if (currentC[0] == loadColNum) {
          currentC[1] = loadCol
          currentC[2] = loadCol
        }
      }
    }
  }
}