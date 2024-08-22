let _selectedAxisElement;
let _rangePoints;
let jsonObjectForUnity;

window.onload = function () {
  const elements = Array.from(document.getElementsByClassName("axis-option"));

  for (const element of elements) {
    if (element.checked) {
      _selectedAxisElement = element;
      break;
    }
  }
};

function onSimplify() {
  let equation = document.getElementById("equation");
  let scope = _getScope(_getAxis(_selectedAxisElement));

  _simplify(equation, scope);
}

function _simplify(equation, scope) {
  if (scope.x !== null) {
    equation.value = equation.value.replaceAll("x", `( ${scope.x} )`);
  } else if (scope.y !== null) {
    equation.value = equation.value.replaceAll("y", `( ${scope.y} )`);
  } else if (scope.z !== null) {
    equation.value = equation.value.replaceAll("z", `( ${scope.z} )`);
  }

  //console.log(`replaced equation value: ${equation.value}`);

  let simplified = math.simplify(equation.value).toString();
  simplified = math.simplify(equation.value, scope).toString();

  simplified = simplified.replaceAll("[", "(");
  simplified = simplified.replaceAll("]", ")");

  // console.log(
  //   `simplify called on ${equation.value} with scope ${JSON.stringify(scope)}`
  // );
  console.log(`simplified value = ${simplified}`);

  // simplify again to remove parenthesis
  simplified = math.simplify(equation.value, scope).toString();
  simplified = simplified.replaceAll("[", "(");
  simplified = simplified.replaceAll("]", ")");

  equation.value = simplified;
}

function onEvaluate() {
  let equation = document.getElementById("equation");
  let scope = _getScope(_getAxis(_selectedAxisElement));

  _evaluate(equation, scope);
}

function _evaluate(equation, scope) {
  let parsed = math.parse(equation.value);
  parsed = parsed.compile();
  let evaluated = parsed.evaluate(scope).toString();
  //let evaluated = math.evaluate(equation, scope);

  console.log(
    `evaluate called on ${equation.value} with scope ${JSON.stringify(scope)}`
  );
  console.log(`evaluated value = ${evaluated}`);

  equation.value = evaluated;
}

function onToggleAxisCheckbox(element) {
  // Get elements with the same class
  const elements = Array.from(
    document.getElementsByClassName(element.className)
  );

  elements.forEach((other) => {
    if (element.name !== other.name) {
      other.checked = false;
    }
  });

  // Ensure the clicked checkbox remains checked
  element.checked = true;

  _selectedAxisElement = element;
  // backticks` not '
  console.log(`Axis ${element.name}, is checked: ${element.checked}`);
}

// if it doesnt have export, it is a private function in ES6
function _getAxis(element) {
  const elements = Array.from(
    document.getElementsByClassName(element.className)
  );

  let axis;
  for (const element of elements) {
    if (element.checked) {
      axis = element;
      break;
    }
  }

  console.log(`getting scope from ${axis.name}`);
  return axis;
}

function _getScope(axis) {
  // Can not define x,y,z as null; throws error.
  let scope;
  let start;

  if (axis !== null) {
    switch (axis.name) {
      case "checkbox-x":
        // Define a range of values using math.range
        start = document.getElementById("x-input").value;
        scope = { x: start };
        break;

      case "checkbox-y":
        start = document.getElementById("y-input").value;
        scope = { y: start };
        break;

      case "checkbox-z":
        start = document.getElementById("z-input").value;
        scope = { z: start };
        break;
    }
    //console.log(`scope set on ${axis.name} for point ${start}`);
  }

  return scope;
}

function onSolveRange() {
  let equation = document.getElementById("equation");
  let scope = _getScope(_getAxis(_selectedAxisElement));

  let x = document.getElementById("x-input").value;
  let y = document.getElementById("y-input").value;
  let z = document.getElementById("z-input").value;

  let start = document.getElementById("start-input").value;
  let end = document.getElementById("end-input").value;
  let precision = document.getElementById("precision-input").value;
  let axis = _getAxis(_selectedAxisElement);

  console.log(
    `solving for range from ${start} to ${end} with precision of ${precision}`
  );
  // simplify and solve should be done in a for loop simlifying selected A,B and solving.
  // todo: don't modify equation value inside simplify and solve.

  let simplified;

  _rangePoints = new Array();

  for (let a2 = start; a2 < end; a2 = Number(a2) + Number(precision)) {
    b = 0;
    for (let b2 = start; b2 < end; b2 = Number(b2) + Number(precision)) {
      // todo: reset the equation
      switch (axis.name) {
        case "checkbox-x":
          simplified = _simplifyRange(equation, scope, x, a2, b2);
          break;
        case "checkbox-y":
          simplified = _simplifyRange(equation, scope, a2, y, b2);
          break;
        case "checkbox-z":
          simplified = _simplifyRange(equation, scope, a2, b2, z);
          break;
      }
      console.log(`simplified: ${simplified}`);
      // todo: put in simplified equation string solve axis,
      let solution = _solveRange(simplified, axis);
      
      // sin(z) 
      if (solution == null){
        continue;
      }

      let solutions = solution.toString().split(",");

      solutions.forEach((s) => {
        // run this in a for each loop
        s = math.evaluate(s); // to convert from fraction to float.
        let point = _getPointFromSolution(s, axis, a2, b2);

        if (
          point.x === "'can't be solved'" ||
          point.y === "'can't be solved'" ||
          point.z === "'can't be solved'"
        ) {
          // console.log(
          //   `The equation can not be solved for ${axis.name} at ${a2}, ${b2}. 
          // This is due to algebrajs not having an algorithm to solve this type of equation.
          // It maybe possible to find the solution with brute forced plug-in values for ${axis.name},
          // over a designated range, then getting returns within a threshold.`
          // );
          return;
          //_rangePoints.push(point);
        }

        if (
          point.x === "'no solution'" ||
          point.y === "'no solution'" ||
          point.z === "'no solution'"
        ) {
          // console.log(
          //   `The equation does not have a solution at ${
          //     axis.name
          //   } at ${a2}, ${b2}, 
          // ${(point.x, point.y, point.z)}`
          // );
        } else {
          // console.log(
          //   `The equation can be solved for ${axis.name} at at ${a2}, ${b2},\n  
          // [${point.x}, ${ point.y}, ${point.z}]`
          // );

          _rangePoints.push(point);
        }
      });
    }
  }
  _rangePoints.forEach((e) => console.log(e));
  SetJSON_DataForUnity(start, end, precision, _rangePoints);
  let jsondata = GetJSON_DataForUnity();
  SaveJSON_DataForUnity(jsondata);
}

// todo: don't change equation value.
function _simplifyRange(equation, scope, x, y, z) {
  let simplified = math.simplify(equation.value).toString();

  if (scope.x == null) {

    
    simplified = simplified.replaceAll("x", `( ${x} )`);
    simplified = math.simplify(simplified, { x: x }).toString();


    simplified = simplified.replaceAll("[", "(");
    simplified = simplified.replaceAll("]", ")");
  }
  if (scope.y == null) {
    

    simplified = simplified.replaceAll("y", `( ${y} )`);
    simplified = math.simplify(simplified, { y: y }).toString();


    simplified = simplified.replaceAll("[", "(");
    simplified = simplified.replaceAll("]", ")");
  }
  if (scope.z == null) {
    

    simplified = simplified.replaceAll("z", `( ${z} )`);
    simplified = math.simplify(equation.value, { z: z }).toString();


   

    simplified = simplified.replaceAll("[", "(");
    simplified = simplified.replaceAll("]", ")");
  }

  // simplify again to remove parenthesis
  simplified = math.simplify(simplified).toString();
  
  simplified = math.format(simplified,{exponential:{lower: 1e-100000, upper: 1e100000}}).toString();
  simplified = simplified.replaceAll("\"", "").toString();

  simplified = scientificToDecimal(simplified);

  simplified = simplified.replaceAll("0.000000z", "(900000000000000000001)^10 * z");
  simplified = simplified.replaceAll("0.000000y", "(900000000000000000001)^10 * y");
  simplified = simplified.replaceAll("0.000000x", "(900000000000000000001)^10 * x");
  simplified = simplified.replaceAll(". ", ".0");
  simplified = simplified.replaceAll(" .", "0.");

  simplified = simplified.replaceAll("[", "(");
  simplified = simplified.replaceAll("]", ")");
  
  

  return simplified;
}

function _solveRange(str, axis) {
  //let solution = algebraHelper.getRangeSolution(str, axis);

  // todo: getRangeSolution should return x,y,z vector, add it to a global array.

  // todo: make sure all -negative fractions are fixed so that algebrajs can solve it.
  // for example, 2 + -3 / 8 is what it simplifies to. iterate the string from end to start
  // replacing combos of "+ -" and "- +" "- -" with "-","-","+" respectively
  str = str.replaceAll("+ -", "  -");
  str = str.replaceAll("- -", " + ");
  //str = str.replaceAll("- +", "  -");

  let variable;

  let parsed = algebra.parse(str);
  let eq = new algebra.Equation(parsed, 0);

  if (axis.name === "checkbox-x") {
    variable = "x";
  } else if (axis.name === "checkbox-y") {
    variable = "y";
  } else if (axis.name === "checkbox-z") {
    variable = "z";
  }

  let solution = eq.solveFor(variable);

  return solution;
}

function _getPointFromSolution(solution, axis, a, b) {
  let x;
  let y;
  let z;

  if (axis.name === "checkbox-x") {
    variable = "x";
  } else if (axis.name === "checkbox-y") {
    variable = "y";
  } else if (axis.name === "checkbox-z") {
    variable = "z";
  }

  if (solution && solution.toString() !== "") {
    solution = solution.toString();
  } else if (!solution) {
    solution = "'can't be solved'";
  } else if (solution.toString().length === 0) {
    solution = "'no solution'";
  }

  if (axis.name === "checkbox-x") {
    x = solution;
    y = a;
    z = b;
  } else if (axis.name === "checkbox-y") {
    x = a;
    y = solution;
    z = b;
  } else if (axis.name === "checkbox-z") {
    x = a;
    y = b;
    z = solution;
  }
  //console.log(`x = ${x},`, `y = ${y}`, `z = ${z}`);
  return { x: x, y: y, z: z };
}

function SetJSON_DataForUnity(start, end, precision, points) {
  jsonObjectForUnity = {
    Start: start,
    End: end,
    Precision: precision,
    RangePoints: points,
  };
}

function GetJSON_DataForUnity() {
  let jsonData = JSON.stringify(jsonObjectForUnity);
  return jsonData;
}

function SaveJSON_DataForUnity(data) {
  save("gc_JSON_DataForUnity.json", data);
}

function save(filename, data) {
  const blob = new Blob([data], { type: "text/csv" });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename);
  } else {
    const elem = window.document.createElement("a");
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
}


function stripSign(str) {
  // Check if it has a minus sign
  let hasMinus = str.charAt(0) === '-';
  // Remove it if it does
  if (hasMinus || str.charAt(0) === '+') {
      str = str.substring(1);
  }
  return [hasMinus, str];
}


function scientificToDecimal(str) {
  if (/\d+\.?\d*e[\+\-]*\d+/i.test(str)) {
      let isNegative, isSmall;
      // Remove the sign by slicing the string
      [isNegative, str] = stripSign(str);
      // Split it into coefficient and exponent
      let [c, e] = str.toLowerCase().split('e');
      // Split the coefficient into the whole and decimal portion
      let [w, d] = c.split('.');
      // Provide and empty sting for safety if in the form n(e)n
      d = d || '';
      // The total length of the string
      let length = w.length + d.length;
      // The total string minus the dot
      let numString = w + d;
      // If it's small then we need to calculate the leading zeros
      // The shift of the decimal place to the left
      const dotLocation = w.length + Number(e);
      // Is the dot needed or not
      const dot = dotLocation === length ? '' : '.';
      let value;
      if (dotLocation <= 0) {
          // Join the value but pad after the dot with zeroes
          value = `0${dot}${'0'.repeat(Math.abs(dotLocation))}${numString}`;
      }
      else if (dotLocation > length) {
          value = `${numString}${'0'.repeat(Math.abs(dotLocation - length))}`;
      }
      else {
          value = `${numString.substring(0, dotLocation)}${dot}${numString.substring(dotLocation)}`;
      }
      return isNegative ? '-' + value : value;
  }
  return str;
}