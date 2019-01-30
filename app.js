
//**************************************** *//
//-----------BUDGET CONROLLER MODULE - keeps track of all income e expenses--------//
//**************************************** *//
let budgetController = (function () {

  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0){
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    total: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  var calculateTotal = (type) => {
    var sum = 0;
    data.allItems[type].forEach ( element => {
      sum += element.value;
    });
    data.total[type] = sum;
  };

  return { //public data
    addItem: (type, des, val) => {

      var newItem, ID;

      //Create new Id
      if (data.allItems[type].length> 0) {
        ID = data.allItems[type][data.allItems[type].length -1].id + 1;
      } else {
        ID = 0;
      };

      //Create new Item based on input type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      //Push the newItem data to the array in budgetController
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: (type, id) => {
      var ids, index;

      ids = data.allItems[type].map( element => element.id);

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index,1);
      }

    },

    calculateBudget: () => {
      //1 calculate the total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      //2 calculate the budget: inc - exp
      data.budget = data.total.inc - data.total.exp;
      //3 calculate the percentage

      if (data.total.inc > 0) {
      data.percentage = Math.round((data.total.exp/data.total.inc)*100)
      } else {
        data.percentege = -1;
      }
    },

    calculatePercentage: () => {
      data.allItems.exp.forEach(element => element.calcPercentage(data.total.inc))
    },

    getPercentage: () => {
      var allPerc = data.allItems.exp.map(element => {
        return element.getPercentage()
      });
      return allPerc
    },

    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.total.inc,
        totalExp: data.total.exp,
        percentage: data.percentage,

      }
    },

    test: () => {
      console.log(data);
    },

    saveToStorage: () => {
      localStorage.setItem('items', JSON.stringify(data))
    },

    returnStorage: () => {
      JSON.parse(localStorage.getItem('items')) || []
    },
  }

})();

//**************************************** *//
//---------UI CONTROLLER MODULE-------------//
//**************************************** *//

let UIController = (function () {

  //add the strings of html tags in objects properties, privte data
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel:'.budget__income--value',
    expensesLabel:'.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentage: '.item__percentage',
    dateLabel: '.budget__title--month'
  }

  var formatNumber = (num, type) => {
    var numSplit, int, dec, sign;
    // + or - before number

    // exactly 2 decimal points

    //comma separating the thousands

    num = Math.abs(num)
    num = num.toFixed(2)

    numSplit = num.split('.');
    int = numSplit[0];
    dec = numSplit[1];

    if (int.length > 3) {
      int = int.substring(0, int.length -3) + ',' + int.substring(int.length -3, 3)
    }

    return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = (list, callback) => {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

return {  //public data
  getingIput: () => {

    return {
      type : document.querySelector(DOMstrings.inputType).value, // inc or exp
      description: document.querySelector(DOMstrings.inputDescription).value,
      value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
    };
  },


  addListItem: (obj, type) => {
    var html, newHtml, element;

    //Create a HTML String with a placeholder

    if (type === 'inc') {
      element = DOMstrings.incomeContainer;
      html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div></div>'

    } else if (type === 'exp') {
      element =DOMstrings.expensesContainer;
      html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'

    }
  
    //Replace the placeholder with some actual data
    newHtml = html.replace('%id%',obj.id);
    newHtml = newHtml.replace('%description%',obj.description);
    newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));
    //Insert the HTML into the DOM
    document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
  },

  deleteListItem: (selectID) => {
    var element = document.getElementById(selectID);
    element.parentNode.removeChild(element);

  },

  getDOMstrings: () => { //make it public
    return DOMstrings;
  },

  //clear the fields after add a new item
  clearFields: () => {
    var fields, fieldsArr;
   fields =  document.querySelectorAll(DOMstrings.inputValue + ', ' + DOMstrings.inputDescription); // returns a list
   fieldsArr = Array.prototype.slice.call(fields); // changes the list to an array

   fieldsArr.forEach(element => {
     element.value = '';
   });
   fieldsArr[0].focus();
  },

  displayBudget: (obj) => {
    var type;
    obj.budget > 0 ? type = 'inc' : type = 'exp';

    document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
    document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
    document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
    if (obj.percentage > 0) {
    document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
    } else {
      document.querySelector(DOMstrings.percentageLabel).textContent ='---'
    }''
  },

  displayPercentage: (percentage) => {
    //selecting all percentage labels, returns a node list
    var fields = document.querySelectorAll(DOMstrings.expensesPercentage);

    //define a forEach function to node list
    nodeListForEach(fields, (el, i) => {
     if (percentage < 0) {
        el.textContent = '---';
      } else {
       el.textContent = percentage[i] + '%';
      }
    });
  },

  displayMonth: () => {
    var now, year, month;
    now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    
  },

  changeType: () => {
    var fields = document.querySelectorAll(
      DOMstrings.inputType + ',' + 
      DOMstrings.inputDescription + ',' + 
      DOMstrings.inputValue);

    nodeListForEach(fields, (el) => {
      el.classList.toggle('red-focus');
    });
    document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
  },
}

})();

//**************************************** *//
//---------APP CONTROLLER MODULE-----------//
//**************************************** *//

let appController = (function (budgetCtrl, UICtrl) {

  var setUpEventListenners = () => {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
    //set the enter as key as trigger for the event
    document.addEventListener('keypress', (event) => {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    //set up the event on the parent element, event delegation
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)
  }

  var updateBudget = () => {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    //2.Return the budget
    var budget = budgetCtrl.getBudget();
    // 3. display the budget in the ui
    UICtrl.displayBudget(budget)
  }

  var updatePercentage = () => {
    //1 Calculate Percentage
    budgetCtrl.calculatePercentage();
    //2 Read the percentage from the budget controller
    var percentage = budgetCtrl.getPercentage();
    //3 Update the UI with the percentages
    UICtrl.displayPercentage(percentage)
  }

  var ctrlAddItem = () => {
    // .1 get the field input data
    let input = UICtrl.getingIput();

    if (input.description !=="" && !isNaN(input.value) && input.value > 0){
    // .2 add the data to the budget controller
    let newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    //.3 add the new item to the user interface
    UICtrl.addListItem(newItem, input.type);
    UICtrl.clearFields();
    //.4 calculate and update the budget
      updateBudget();
    // .5 calculate and update the percentage
      updatePercentage();
    // .6 Save to local storage
    budgetCtrl.saveToStorage()
    }
  }

  var ctrlDeleteItem = event => {
    var itemID, splitID, type, ID;

    // get the event bubbling from the button
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID){    
      
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //.1 delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);
      //.2 delete the item from the UI
      UICtrl.deleteListItem(itemID)
      //.3 update and show the new budget
      updateBudget();
      // .4 Save to local storage
      budgetCtrl.saveToStorage()
    }
  }
  
  return { //public data
    init: () => {
      console.log('The Application Has Started');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      })
      setUpEventListenners();
      budgetCtrl.returnStorage();

    }
  }

})(budgetController, UIController);

appController.init();