// BUDGET CONTROLLER MODULE
var budgetController = (function() {
	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.floor((this.value/totalIncome)*100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};


	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(cur) {
			sum += cur.value;
		});
		data.total[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []	
	 	},
		total: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	return {
		addItem: function(type, desc, val){
			var newItem, ID;

			// get ID of last item in 'inc' or 'exp' 
			if (data.allItems[type].length>0){
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			// create a new item based on inc or exp
			if(type==='inc') {
				newItem = new Income(ID, desc, val);
			} else if(type==='exp') {
				newItem = new Expense(ID, desc, val);
			}

			// push the new item created in the array of 'inc' or 'exp'
			data.allItems[type].push(newItem)

			// Return the new item created
			return newItem;
		},

		deleteItem: function(type, id) {
			var ids, index;

			// array of id of all the elements in the data.allItems[type]
			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			// getting index of id of element we want to delete
			index = ids.indexOf(id);


			if(index !== -1){
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function() {

			// calculate total income and expenses
			calculateTotal('inc');
			calculateTotal('exp');

			// calculate budget: income-expenses
			data.budget = data.total['inc'] - data.total['exp']; 

			// Calculate percentage of income spent
			if (data.total['inc'] > 0) {
				data.percentage = Math.round((data.total['exp']/data.total['inc'])*100);
			} else {
				data.percentage = -1;
			}
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(function(current) {
				current.calcPercentage(data.total.inc);
			});
		},

		getPercentages: function() {
			var allPerc = [];
			data.allItems.exp.map(function(current){
				allPerc.push(current.getPercentage());
			});
			return allPerc;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				percentage: data.percentage,
				totalInc: data.total['inc'],
				totalExp: data.total['exp']
			}
		},

		testing: function() {
			console.log(data); 
		}
	};
})();



// UI CONTROLLER MODULE
var UIController = (function() {

	var DOMStrings = {
		inputType: ".add__type",
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputButton: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel:'.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercentLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber =  function(num, type) {
		var int, numSplit, dec;
		
		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');
		int = numSplit[0];
		if (int.length>3){
			int = int.substring(0, int.length-3) + ',' + int.substring(int.length-3, int.length);
		}
		dec = numSplit[1];
		
		return (type === 'exp'? '-' : '+') + ' ' + int + '.' + dec;
	}
	var nodeListForEach = function(fieldList, callbackFunction) {
		for (var i = 0 ; i < fieldList.length; i++) {
			callbackFunction(fieldList[i], i);
		}
	};



	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMStrings.inputType).value,
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value) 
			};
		},

		addListItem: function(obj, type) {
			var html, newHtml, element; 
			// create HTML string with placeholder text

			if (type==='inc') {
				element = DOMStrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div>';
			} else if (type==='exp'){
				element = DOMStrings.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
			}

			// replace placeholder text with actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// insert html into the dom
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields: function() {
			var fields, fieldsArr; 
			// querySelectorAll returens a list on which array methods cannot be applied
			fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

			// converting fields list to an array fieldsArr using slice method
			fieldsArr = Array.prototype.slice.call(fields);

			// current item thats being processed, index of current item, entire array
			fieldsArr.forEach( function(current, index, array) {
				current.value = "";
			});

			fieldsArr[0].focus();
		}, 

		displayBudget: function(obj) {
			var type = obj.budget > 0 ? 'inc' : 'exp';
			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
			
			if (obj.percentage > 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage;
			} else {
				document.querySelector(DOMStrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMStrings.expensesPercentLabel);
			nodeListForEach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},

		displayMonth: function() {
			var now, month, year;
			now = new Date();
			months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
			month = now.getMonth();
			year = now.getFullYear();

			document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
		},

		changeType: function() {

			fields = document.querySelectorAll(
				DOMStrings.inputType + ', ' +
				DOMStrings.inputDescription + ',' +
				DOMStrings.inputValue
			);

			nodeListForEach(fields, function(current) {
				current.classList.toggle('red-focus');
			});
			document.querySelector(DOMStrings.inputButton).classList.toggle('red');
			
		},

		getDOMStrings : function() {
			return DOMStrings;
		}
	};

})();




// GLOBAL APP CONTROLLER MODULE 
var controller = (function(budgetCtrl, UICtrl) {

	var setupEventListeners = function() {

		var DOM = UICtrl.getDOMStrings();
		document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13 || event.which === 13)  {
				ctrlAddItem();
			}		
		});
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
	};

	var updateBudget = function(){
		var budget;

		// 4. calculate the budget
		budgetCtrl.calculateBudget();

		// 5 Return budget
		budget = budgetCtrl.getBudget();

		// 6. display the budget
		console.log(budget);
		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function() {

		// 1. Calculate the percemtages
		budgetCtrl.calculatePercentages();

		// 2. read them from budget controller
		var perc = budgetCtrl.getPercentages();

		// 3. Update UI with new percentages
		console.log(perc);
		UICtrl.displayPercentages(perc);
	
	};

	var ctrlAddItem = function(){
		var input, newItem;
		// get the field input data
		input = UICtrl.getInput();
		
		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// 1. add the item to budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 2. add the item to UI
			UICtrl.addListItem(newItem, input.type);

			// 3. clear fields and move inpot pointer(focus) to description
			UICtrl.clearFields()

			// 4. calculate and update budget
			updateBudget();

			// 5. update percentages
			updatePercentages();
		}
	};

	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// 1. Delete Item from Data structure
			budgetCtrl.deleteItem(type, ID);

			// 2. Delete item from UI
			UICtrl.deleteListItem(itemID);

			// 3. Update and show new budget
			updateBudget();

			// 4. update percentages
			updatePercentages();

		}
	};

	return {
		init: function() {
			console.log('APPLICATION HAS STARTED');
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				percentage: -1,
				totalInc: 0,
				totalExp: 0
			});
			setupEventListeners();
		}
	}


})(budgetController, UIController);	


controller.init();