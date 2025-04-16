/**
 * Data Catalog Project Starter Code - SEA Stage 2
 *
 * This file is where you should be doing most of your work. You should
 * also make changes to the HTML and CSS files, but we want you to prioritize
 * demonstrating your understanding of data structures, and you'll do that
 * with the JavaScript code you write in this file.
 *
 * The comments in this file are only to help you learn how the starter code
 * works. The instructions for the project are in the README. That said, here
 * are the three things you should do first to learn about the starter code:
 * - 1 - Change something small in index.html or style.css, then reload your
 *    browser and make sure you can see that change.
 * - 2 - On your browser, right click anywhere on the page and select
 *    "Inspect" to open the browser developer tools. Then, go to the "console"
 *    tab in the new window that opened up. This console is where you will see
 *    JavaScript errors and logs, which is extremely helpful for debugging.
 *    (These instructions assume you're using Chrome, opening developer tools
 *    may be different on other browsers. We suggest using Chrome.)
 * - 3 - Add another string to the titles array a few lines down. Reload your
 *    browser and observe what happens. You should see a fourth "card" appear
 *    with the string you added to the array, but a broken image.
 *
 */

  let columns = {};

  function loadCSV() {
    fetch('Student Depression Dataset.csv') // load CSV file
      .then(handleResponse)
      .then(processCSV)
      .catch(handleError);
  }

  // converts response to text
  function handleResponse(response) {
    return response.text(); // full CSV as string
  }

  //process the CSV string, removing whitespace and splitting based on lines
  function processCSV(csvText) {
    // split into rows, assign headerLine the first line, and assign the dataLines every subsequent line
    const lines = csvText.trim().split('\n');
    const headerLine = lines[0];
    const dataLines = lines.slice(1);

    const headers = headerLine.split(','); //splits first line (headers) into an array by comma

    // convert lines into an array of objects
    const rows = dataLines.map(function(line) {
      const values = line.split(',');
      const obj = {}; //each row gets a new array object
      headers.forEach(function(header, index) {
        obj[header] = values[index];
      });
      return obj;
    });

    // create a column-wise object: { Header1: [...], Header2: [...], ... }, 
    // essentially a hashmap object of arrays where the key is the header, and each value is an array of data under that header
    columns = {};
    headers.forEach(function(header) { //for each header,
      columns[header] = rows.map(function(row) { //assign each value corresponding to that header into the array, similar to searching and sorting over a 2D array data[i][j]
        return row[header]; //get the value in current column (based on header) for the row, putting it into the columns object
      });
    });

    console.log(columns);
    displayTable(columns);
    populateDropdowns(columns);
  }

  // handles errors
  function handleError(error) {
    console.error('Error loading CSV:', error);
  }

  function displayTable(columns) {
    const container = document.getElementById("tableContainer");
    container.innerHTML = ""; // clear old table if any
  
    const headers = Object.keys(columns);
    const maxRows = 100; // adjust as needed
    const numRows = Math.min(columns[headers[0]].length, maxRows);
  
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
  
    // header row
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach(header => {
      const th = document.createElement("th");
      th.textContent = header;
      th.style.border = "1px solid #999";
      th.style.padding = "6px";
      th.style.background = "#f2f2f2";
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
  
    // data rows
    const tbody = document.createElement("tbody");
    for (let i = 0; i < numRows; i++) {
      const tr = document.createElement("tr");
      headers.forEach(header => {
        const td = document.createElement("td");
        td.textContent = columns[header][i];
        td.style.border = "1px solid #999";
        td.style.padding = "6px";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }
  
    table.appendChild(tbody);
    container.appendChild(table);
  }

  function populateDropdowns(columns) {
    const xSelect = document.getElementById("xSelect");
    const ySelect = document.getElementById("ySelect");
  
    xSelect.innerHTML = "";
    ySelect.innerHTML = "";
  
    const headers = Object.keys(columns);
  
    headers.forEach(header => {
      const optionX = document.createElement("option");
      optionX.value = optionX.textContent = header;
      xSelect.appendChild(optionX);
  
      const optionY = document.createElement("option");
      optionY.value = optionY.textContent = header;
      ySelect.appendChild(optionY);
    });
  }

  function sortData (points, sortBy){
    if (sortBy === 'x') {
      return points.sort((a, b) => a.x - b.x);
    } else if (sortBy === 'y') {
      return points.sort((a, b) => a.y - b.y);
    }
    return points;
    }

  function drawGraph() {
    const xKey = document.getElementById("xSelect").value;
    const yKey = document.getElementById("ySelect").value;
    const sortBy = document.getElementById("sortData").value;
    console.log("Drawing graph for:", xKey, yKey);
  
    const canvas = document.getElementById("lineGraph");
    const ctx = canvas.getContext("2d");
  
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    const xData = columns[xKey];
    const yData = columns[yKey];
  
    // Convert to numbers, skip non-numerics
    const points = [];
    for (let i = 0; i < xData.length; i++) {
      const x = parseFloat(xData[i]);
      const y = parseFloat(yData[i]);
      if (!isNaN(x) && !isNaN(y)) {
        points.push({ x, y });
      }
    }

    const sortedPoints = sortData(points, sortBy);

    if (sortedPoints.length === 0) {
      alert("No numeric data to plot.");
      return;
    }
  
    // Get min/max
    const margin = 40;
    const w = canvas.width - margin * 2;
    const h = canvas.height - margin * 2;
  
    const xMin = Math.min(...points.map(p => p.x));
    const xMax = Math.max(...points.map(p => p.x));
    const yMin = Math.min(...points.map(p => p.y));
    const yMax = Math.max(...points.map(p => p.y));
  
    // Scale function
    const scaleX = x => margin + ((x - xMin) / (xMax - xMin)) * w;
    const scaleY = y => canvas.height - margin - ((y - yMin) / (yMax - yMin)) * h;
  
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, canvas.height - margin);
    ctx.lineTo(canvas.width - margin, canvas.height - margin);
    ctx.stroke();
  
    // Draw line
    ctx.beginPath();
    points.forEach((pt, index) => {
      const x = scaleX(pt.x);
      const y = scaleY(pt.y);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  //converts an Indian CGPA (10 pt scale) to its US equivalent GPA (4 pt scale)
  //was going to implement if CGPA was selected in x/y dropdowns but couldn't finish in time
  function gpaConvert(cgpa){
    return (cgpa / 10) * 4;
  }

  loadCSV();

// This is an array of strings (TV show titles)
let titles = [
  "Fresh Prince of Bel Air",
  "Curb Your Enthusiasm",
  "East Los High",
  "Balls in my jaws"
];
