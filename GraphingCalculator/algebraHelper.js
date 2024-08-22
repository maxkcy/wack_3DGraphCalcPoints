function onSolve() {
  let equation = document.getElementById("equation").value;
  _solve(equation);
}

function _solve(str) {
  let parsed = algebra.parse(str);
  // old wrong example code below that did not work. but this works. ok.
  //let expr = new algebra.Expression(parsed.toString());
  console.log(`expr passed to algebrajs: ${parsed.toString()}`);

  // 0 is what the equation is equal to.
  let eq = new algebra.Equation(parsed, 0);
  //equation.value = eq;
  console.log(`the equation is ${eq.toString()}`);

  const elements = Array.from(document.getElementsByClassName("axis-option"));

  let variable;
  for (const element of elements) {
    if (element.checked) {
      _selectedAxisElement = element;

      if (_selectedAxisElement.name === "checkbox-x") {
        variable = "x";
      } else if (_selectedAxisElement.name === "checkbox-y") {
        variable = "y";
      } else if (_selectedAxisElement.name === "checkbox-z") {
        variable = "z";
      }

      break;
    }
  }

  let solution = eq.solveFor(variable);
  equation.value = `${variable} = ${solution}`;
  console.log(`${variable.toString()} is ` + solution.toString());
}

function getRangeSolution(str, axis) {
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
