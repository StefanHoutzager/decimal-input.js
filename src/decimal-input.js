      const addThousandsSeparators = (e, intPart) => 
        [...intPart]
        .reverse()
        .reduce((returnValue, digit, index) => returnValue += (index % 3 == 0 ? (thousandsSeparator(e.target) + digit) : digit))
        .split('')
        .reverse()
        .join(''); 

      const backspaceKeyDownIntegerPart = e => {
        if (jumpOverSeparator(e)) {
          return -1;
        } 		
        if (isWholeValueSelected(e)) {
          printDefaultValue(e.target);
          return 0;
        }		
        if (isNegative(e.target.value) && e.target.selectionStart === 1 && nothingIsSelected(e)) {
          e.target.value = substring(e.target.value, 1);
          return 0;
        }
        if ( // there is one integer digit, cursor right of it or the integerpart is selected  
             (
               (e.target.selectionStart === 1 || (e.target.selectionStart === 2 && isNegative(e.target.value))) 
                && nothingIsSelected(e) && integerPart(e).length === 1
             )
             || (cursorLeftOfFirstDigit(e) && e.target.selectionEnd === endOfIntegerPartLocation(e)) 
           ) { 
          e.target.value = replaceWithIntPart(e, '0');
          return -1;  
        }
        else {
          const nothingSelected = nothingIsSelected(e);
          let elementValue = '';
          if (cursorLeftOfFirstDigit(e) && decSeparatorInSelection(e)) {
            elementValue = replaceWithIntPart(e, '0');
          }
          else {
            elementValue = replaceWithIntPart(e, '');
          }	
          if (decSeparatorInSelection(e) && numSelectedDecimals(e) > 0) {
            elementValue = replaceAtDecPart(elementValue, e);
          }			
          e.target.value = removeLeadingZeros(elementValue, e); 
          return updatethousandsSeparators(e) + (nothingSelected ? 0 : 1);		
        }				
      }; 
	  
      const clipboardDataContainsDecimalSeparator = (e, clipboardData) => clipboardData.lastIndexOf(decimalSeparator(e.target)) > 0;	  
	  
      const clipboardContainsDisallowedCharacters = e => 
        e.clipboardData.getData('text/plain')
        .split('')
        .filter(x => !isAllowedCharacter(e, x)).length > 0;
	  
      const correctCharacterInputViaNumpadAndDeadKeys = (element) => { 
        if (element.deadKey === true || 
            element.altKeyDown || 
            [...element.value].filter(x => ['^','`','~',"'"].includes(x)).length > 0
           ) {
          const selectionStart = element.selectionStart - 1;
          element.value          = element.oldValue;
          element.selectionStart = selectionStart;
          element.selectionEnd   = selectionStart;
          element.deadKey = false;
        }	  
      };	  	  
	   
      const cursorIsInDecimalPart = e => 
         decSeparatorLoc(e.target) > -1 
         && cursorPositionRight(e) <= numDecimals(e)
         && cursorPositionRight(e) >= 0;	   
	   
      const cursorLeftOfFirstDigit = e => 
        isNegative(e.target.value) ? [0, 1].includes(e.target.selectionStart) : e.target.selectionStart === 0; 
	    	  
      const cursorPositionRight = e => e.target.value.length - e.target.selectionStart;
	 
      const decimalSeparatorDefault = () => 1.1.toLocaleString().substring(1,2);	  
			
      const decimalSeparator = element => 
        element.hasAttribute('decimalSeparator') ? element.getAttribute('decimalSeparator') : decimalSeparatorDefault();
	  
      const decSeparatorInSelection = e => 
        (e.target.selectionEnd - e.target.selectionStart > 1) 
        && decSeparatorLoc(e.target) >= e.target.selectionStart 
        && decSeparatorLoc(e.target) < e.target.selectionEnd; 									
			
      const decSeparatorLoc = element => element.value.lastIndexOf(decimalSeparator(element));
	  	  
      const deleteKeyDownIntegerPart = e => {
        if (jumpOverSeparator(e)) {		
          return 1;
        } 	
        if (isWholeValueSelected(e)) {
          printDefaultValue(e.target);
          return 0;
        }
        if (cursorLeftOfFirstDigit(e)) { 
          if (integerPart(e).length === 1 
              || (e.target.selectionEnd >= decSeparatorLoc(e.target) && isInputWithDecimals(e))
             ) { 
            let elementValue = replaceWithIntPart(e, '0');	
            if ((e.target.selectionEnd > decSeparatorLoc(e.target) + 1) && isInputWithDecimals(e)) {
              elementValue = replaceAtDecPart(elementValue, e);	
            }		
            e.target.value = elementValue;
            return 1;
          }  
          else if(!isInputWithDecimals(e) && isWholeValueSelected(e)) {
            e.target.value = '0';
            return 0;
          }
          else {
            let elementValue = replaceWithIntPart(e, '');
            e.target.value = removeLeadingZeros(elementValue, e); 
          }
        }	
        else {
          let elementValue = replaceWithIntPart(e, '');
          elementValue   = removeLeadingZeros(elementValue, e);
          elementValue   = (
                              (e.target.selectionEnd > decSeparatorLoc(e.target) + 1) 
                               && numDecimalsInFormat(e.target) > 0
                           ) ? replaceAtDecPart(elementValue, e) : elementValue;
          e.target.value = elementValue;		
        }					
        return updatethousandsSeparators(e);	  
      };
	  
      const endOfIntegerPartLocation = e  => numDecimals(e) > 0 ? decSeparatorLoc(e.target) : e.target.value.length;	  
	    
      const handleOnKeydown = e  => {
        e.target.altKeyDown = e.altKey; 
        e.target.oldValue   = e.target.value;
        if (e.key === 'Dead') {e.target.deadKey = true;}
		
        if ((e.key.startsWith('F') && e.key.length > 1)) {return true;}
		
        const selectionStart = e.target.selectionStart;
        let   resetCursor    = 0;

        if (!e.shiftKey) { 
          // The value of the input is divided in an integer- and a decimal part to ease the handling of their different properties.
          // For example: in the integerpart placement of thousandseparators has to be handled, if a number is typed or delete 
          // or backspace, after the decimal separator, the number affected is replaced in the decimalpart while this happens in the
          // integerpart only when the integervalue is zero. The value of resetCursor is calculated and returned by the functions and
          // is used to replace the cursor 
          resetCursor = cursorIsInDecimalPart(e) ? keyDownDecimalPart(e) : keyDownIntegerPart(e); 
        }
			  		  
        if ((!isSpecialKey(e) || isADigit(e.key) || isDeleteKey(e) || e.key === 'Backspace' || isDecimalSeparatorKey(e) || e.key === '-')  
          && !e.ctrlKey) { 
          e.preventDefault();
          e.stopPropagation();
          e.target.selectionStart = (isDecimalSeparatorKey(e) && numDecimalsInFormat(e.target) > 0) ? 
                                      (decSeparatorLoc(e.target) + 1) : 
                                      (selectionStart + resetCursor < 0 ? 0 : selectionStart + resetCursor);
          e.target.selectionEnd   = e.target.selectionStart;
          return false;
        } 		
      };
	  
      const handleOnPaste = e  => {
        if (e.clipboardData.getData('text/plain') != '') {
          const validationMessage = validatePasteValue(e);
          if (validationMessage === '') {  
            const clipboardData = removeLeadingZeros(removeThousandsSeparators(e.target, e.clipboardData.getData('text/plain')), e);
            if (numDecimalsInFormat(e.target) > 0 ) { 
              if (clipboardDataContainsDecimalSeparator(e, clipboardData)) {
                e.target.value = clipboardData + 
                                 (numDecimalsToAdd(e, clipboardData) > 0 ? '0'.repeat(numDecimalsToAdd(e, clipboardData)) : '');
              } 	
              else {
                e.target.value = clipboardData + decimalSeparator(e.target) + '0'.repeat(numDecimalsToAdd(e, clipboardData));
              }			
            }
            else {
              e.target.value = clipboardData; 
            }	
            const dummy = updatethousandsSeparators(e);
          }
          else {
            showMessage(e, validationMessage); 
          }
        }
        e.preventDefault();
        e.stopPropagation();
        return false;		
      };
	  
      const insertNumberKey = e => {
	    let startString = '';

        if (isNegative(e.target.value)) {
          // if there is a selection starting at position 0 just start with an empty string
          if (e.target.selectionStart > 0 || nothingIsSelected(e)) { 
            // take the slice of the input value left of the cursor position, leave out an eventual starting zero
            startString = '-' + (e.target.value.slice(integerPart(e).startsWith('0') ? 2 : 1, e.target.selectionStart));  
          }
        } else { // take the slice of the input value left of the cursor position, leave out an eventual starting zero
          startString = (e.target.value.slice(integerPart(e).startsWith('0') ? 1 : 0, e.target.selectionStart)); 
        } 		
        return startString
         + e.key 
         + e.target.value.slice(decSeparatorInSelection(e) ? decSeparatorLoc(e.target) : e.target.selectionEnd);
      }
	  
      const insertStyleSheetRule = ruleText => {
        const sheets = document.styleSheets;

        if(sheets.length == 0) {
          let style = document.createElement('style');
          style.appendChild(document.createTextNode(''));
          document.head.appendChild(style);
        }
		 
        let sheet = sheets[sheets.length - 1];
        sheet.insertRule(ruleText, sheet.rules ? sheet.rules.length : sheet.cssRules.length);
      };
	  
      const insertStyleSheetRules = () => {
        insertStyleSheetRule('@keyframes         fadein  {from {bottom: 0;    opacity: 0;} to {bottom: 30px; opacity: 1;}}');
        insertStyleSheetRule('@-webkit-keyframes fadein  {from {bottom: 0;    opacity: 0;} to {bottom: 30px; opacity: 1;}}');
        insertStyleSheetRule('@keyframes         fadeout {from {bottom: 30px; opacity: 1;} to {bottom: 0;    opacity: 0;}}');
        insertStyleSheetRule('@-webkit-keyframes fadeout {from {bottom: 30px; opacity: 1;} to {bottom: 0;    opacity: 0;}}');	
      }; 		
		 
      const integerPart = e   => 
        decSeparatorLoc(e.target) > 0 ? e.target.value.slice(isNegative(e.target.value) ? 1 : 0, decSeparatorLoc(e.target)) : 
        e.target.value.substring(isNegative(e.target.value) ? 1 : 0);
																			  
      const isAllowedCharacter = (e, val) => 
        numbersArray().includes(val) 
        || (val === decimalSeparator(e.target) && e.target.hasAttribute('numDecimals')) 
        ||  val === thousandsSeparator(e.target)
        || (val === '-' && e.target.hasAttribute('allowNegativeSign')) ;																		  
      
      const isDecimalSeparatorKey    = e   => ((e.key === 'Delete' || e.key === 'Del' /* MS Edge */) && e.location === 3) || 
	                                          e.key === decimalSeparator(e.target); 
	  
      const isInputWithDecimals      = e   => numDecimalsInFormat(e.target) > 0
	  
      const isDeleteKey              = e   => ((e.key === 'Delete' || e.key === 'Del' /* MS Edge */) && e.location !== 3);
	  
      const isNegative               = val => val.startsWith('-');
	  
      const isADigit                 = val => (numbersArray().includes(val));	 

      const isSpecialKey             = e   => ['Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 
	                                           'Left' /* MS Edge */, 'Right' /* MS Edge */].includes(e.key);
	  
      const isWholeValueSelected     = e   => e.target.selectionStart === 0 && e.target.selectionEnd === e.target.value.length;
			
      const jumpOverSeparator = e  =>  
        nothingIsSelected(e) 
        && [e.target.value.indexOf(thousandsSeparator(e.target)), decSeparatorLoc(e.target)]
            .includes(e.target.selectionStart - (isDeleteKey(e) ? 0 : 1));		

      const keyDownDecimalPart = e => {
        if (e.key === 'Backspace') {
          const nothingSelected = nothingIsSelected(e);
          if (numSelectedDecimals(e) > 0 || numDecimalsInFormat(e.target) > cursorPositionRight(e)) {
            e.target.value = replaceAtDecPart(e.target.value, e); 
          }		
          return (nothingSelected ? -1 : 0);
        }		  
        if (isDeleteKey(e) && cursorPositionRight(e) !== 0) { 
          e.target.value = replaceAtDecPart(e.target.value, e);
          return 1;
        }	
        if (isADigit(e.key)) { 
          if (cursorPositionRight(e) != 0) {	
    	    e.target.value = replaceAtDecPart(e.target.value, e);
            return 1;
          }		
        }
        return 0;	  
      };		
	  
      const keyDownIntegerPart = e  => {  
        if (isDeleteKey(e)) { 
          return deleteKeyDownIntegerPart(e);
        }  
        if (e.key === 'Backspace') {
          return backspaceKeyDownIntegerPart(e);
        }
        if (isDecimalSeparatorKey(e)) {
          return;
        }
        if (
             isADigit(e.key) && 
             (numDigitsAllowed(e) || !nothingIsSelected(e) || (numAllowedIntegerDigits(e) === 1 && cursorLeftOfFirstDigit(e)))
           ) {
          return numberKeyDownIntegerPart(e);	
        }
        if (e.key === '-' && e.target.hasAttribute('allowNegativeSign') && e.target.selectionStart === 0) {
          if (!isNegative(e.target.value) && nothingIsSelected(e)) {
             e.target.value = '-' + e.target.value;
          }
          else if (
                     !nothingIsSelected(e) && !decSeparatorInSelection(e) && 
                     (integerPart(e).length > (e.target.selectionEnd - e.target.selectionStart))
                  ) {
            e.target.value = '-' + e.target.value.substring(e.target.selectionEnd);
            const dummy = updatethousandsSeparators(e);
          }		
          return 1;
        }
        return 0;
      };
 
      const maxDigitsInFormat = element => {
        if (element.hasAttribute('maxDigits') )  {
          const digits = parseInt(element.getAttribute('maxDigits'));
          if (!(digits > 0)) {
            setConfigError(element, 'maxDigits attribute ' + 
                                     element.getAttribute('maxDigits') + 
                                    ' should be an integer value above zero.'
                          );
            return 0; 
          }
          if (digits > 0 && (digits >= numDecimalsInFormat(element))) {return digits;}
          if (digits <= numDecimalsInFormat(element)) {
            setConfigError(element, 'maxDigits attribute should be greater than numDecimals.'); 
            return 0;
          }
        }   
        setConfigError(element, 'maxDigits attribute not set for this element.'); 
        return 0;
      };	
		
      const maxIntegersInFormat = element => maxDigitsInFormat(element) - numDecimalsInFormat(element);	  
		
      const nothingIsSelected = e  => e.target.selectionStart === e.target.selectionEnd;
	  
      const numAllowedIntegerDigits = e => 
	    parseInt(e.target.getAttribute('maxDigits')) - (e.target.hasAttribute('numDecimals') ? parseInt(e.target.getAttribute('numDecimals')) : 0);
	   
      const numberKeyDownIntegerPart = e =>	{	
        if (cursorLeftOfFirstDigit(e)) {
          if (  
               (e.key === '0'
                && numAllowedIntegerDigits(e) > 1
                && (nothingIsSelected(e) || (integerPart(e).length != 1 && integerPart(e).length > e.target.selectionEnd))
               ) ||
               ((nothingIsSelected(e) && isNegative(e.target.value)) && e.target.selectionEnd === 0)
             ) {
            return 0;	
          } 
          if ((e.target.selectionEnd === 0 || (e.target.selectionEnd === 1 && isNegative(e.target.value)))
              && (numAllowedIntegerDigits(e) === 1 || (integerPart(e).length === 1 && integerPart(e) === '0'))) {
            e.target.value = (isNegative(e.target.value) ? '-' : '') + 
                             e.key + 
                             e.target.value.substring(isNegative(e.target.value) ? 2 : 1);
            return 1;
          }
        }  
        e.target.value = insertNumberKey(e);
        return updatethousandsSeparators(e);
      };	
	  
      const numbersArray = () => ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	  
      const numDecimals = e  => decSeparatorLoc(e.target) > -1 ? e.target.value.split(decimalSeparator(e.target))[1].length : 0;
	  
      const numDecimalsInClipboard = e  => 
        e.clipboardData.getData('text/plain').indexOf(decimalSeparator(e.target)) === -1 ? 0 : 
        e.clipboardData.getData('text/plain').split(decimalSeparator(e.target))[1].length;
		  
      const numDecimalsInFormat = element => {
        if (element.hasAttribute('numDecimals')) {
          const decs = parseInt(element.getAttribute('numDecimals'));
          if (decs > 0) {return decs;}
          setConfigError(element, 'numDecimals attribute ' + 
                                   element.getAttribute('numDecimals') + 
                                  'should be an integer value above zero.'
                        ); 
          return 0;
        }   
        return 0;
      };

      const numDecimalsToAdd = (e, clipboardData) => 
        numDecimalsInFormat(e.target) - 
        (clipboardDataContainsDecimalSeparator(e, clipboardData) ? clipboardData.split(decimalSeparator(e.target))[1].length : 0);		  
																	
      const numDigitsTargetValue = e => e.target.value.split('').filter(x => numbersArray().includes(x)).length;		
	  
      const numDigitsAllowed = e => 
        (numDigitsTargetValue(e) + 1 /* + 1 because numDigitsTargetValue is executed on keydown */) <= maxDigitsInFormat(e.target);	
	  
      const numDigitsInClipboard = e => e.clipboardData.getData('text/plain').split('').filter(x => !isNaN(x)).length;
	  
      const numDigitsInClipboardAllowed = e => numDigitsInClipboard(e) <= maxDigitsInFormat(e.target);	
	  
      const numIntegersInClipboard = e  =>  
        e.clipboardData.getData('text/plain')
        .split(decimalSeparator(e.target))[0]
        .split('')
        .filter(x => x !== thousandsSeparator(e.target) && x !== '-')
        .join('')
        .length;	
		
      const numSelectedDecimals = e => 
        e.target.value.substring(
          (e.target.selectionStart > decSeparatorLoc(e.target) ? e.target.selectionStart : decSeparatorLoc(e.target) + 1), 
          e.target.selectionEnd
        ).length;		

      const numThousandsSeparators = (element, inputValue) => 
        [...inputValue].reduce((a, c) => c === thousandsSeparator(element) ? ++a : a, 0);
			
      const printDefaultValue = element =>  {
        if (numDecimalsInFormat(element) > 0) {
          element.value = '0' + decimalSeparator(element) + '0'.repeat(numDecimalsInFormat(element));
        }
        else {
          element.value = '0';
        }
         /* value in the autofocus field should be selected */
        if (element.hasAttribute('autofocus')) {
          element.selectionStart = 0;
          element.selectionEnd   = element.value.length;
        }		
      }; 		
 
      const removeLeadingZeros = (elementValue, e) => {
        const negativeValue = isNegative(elementValue);
        let   returnValue   = negativeValue ? elementValue.substring(1) : elementValue;
		
        while (
                (returnValue.startsWith('0') && returnValue.split(decimalSeparator(e.target))[0].length > 1) 
                 || returnValue.startsWith(thousandsSeparator(e.target))
              ) {
          returnValue = returnValue.substring(1);
        }
        if (negativeValue) {
          returnValue = '-' + returnValue;
        }
        return returnValue;
      };
	  
      const removeThousandsSeparators = (element, value) => value.split(thousandsSeparator(element)).join('');	  

      const replaceAtDecPart = (elementValue, e) => { 			                                                        
        const insertString = isDeleteKey(e) || e.key === 'Backspace' ? '0'.repeat(numSelectedDecimals(e) || 1) : e.key; 
        let   startString  = '';

        if (isDeleteKey(e)) {
          startString = cursorIsInDecimalPart(e) ? 
                          elementValue.substring(0, e.target.selectionStart) : 
                          elementValue.substring(0, elementValue.indexOf(decimalSeparator(e.target)) + 1);
        }
        else if (e.key === 'Backspace') {
          startString = cursorIsInDecimalPart(e) ? 
                          elementValue.substring(0, e.target.selectionStart - (nothingIsSelected(e) ? 1 : 0)) : 
                          elementValue.substring(0, elementValue.indexOf(decimalSeparator(e.target)) + 1);
        }
        else { 
          startString = elementValue.substring(0, cursorIsInDecimalPart(e) ? 
                          e.target.selectionStart : 
                          decSeparatorLoc(e.target)); 
        } 
        return startString + insertString + elementValue.substring((startString + insertString).length);  
      };
																	
      const replaceWithIntPart = (e, replace) => {
        let startString = e.target.value.substring(0, e.target.selectionStart),
            endString   = e.target.value.substring(decSeparatorInSelection(e) ? 
                            decSeparatorLoc(e.target) : 
                            e.target.selectionEnd);
			
        if (nothingIsSelected(e)) {
          // only integer part 
          if (e.key === 'Backspace') {
            startString = e.target.value.substring(0, e.target.selectionStart - 1);
          }
          else if (isDeleteKey(e)) {
            endString = e.target.value.substring(decSeparatorInSelection(e) ? 
                                                   decSeparatorLoc(e.target) : 
                                                   (e.target.selectionEnd + 1)
                                                 )
          };
        }
        return startString + replace + endString;
      }; 

      const run = () => {	  
	insertStyleSheetRules();

        document.querySelectorAll('input.decimal').forEach(element => { 
          let dummy = testAttributesValidity(element);

          printDefaultValue(element);
			
          element.onpaste = e => { 
            return handleOnPaste(e);
          }	
		
          element.oncut = e => { 
            e.preventDefault(); // prevented for now, could be handled but the input value has to stay valid
            return false;			  
          }			
			
          element.oninput = () => { 
            correctCharacterInputViaNumpadAndDeadKeys(element);
          }			

          element.onkeydown = e => { 
            return handleOnKeydown(e);
          }		

        }); 	
      }; 	  
			
      const setAnimation = (element, animation) => {
        element.style.animation       = animation;
        element.style.WebkitAnimation = element.style.animation;
        element.style.MozAnimation    = element.style.animation;
        element.style.oAnimation      = element.style.animation;
      };
			
      const setConfigError = (element, errorMessage)  => {
        element.style.backgroundColor = 'red';
        errorMessage = element.hasAttribute('title') ? (element.getAttribute('title') + '\u000d' + errorMessage) : errorMessage;
        element.setAttribute('title', errorMessage);
      };   
	  
      const showMessage = (e, message) => {
        let element    = document.getElementById('warning'); 
        let icon       = document.createElement('div');
        let iconholder = document.createElement('div');		
        let text       = document.createElement('div');
        
        iconholder.style.backgroundColor = '#ff9933';
        iconholder.style.width           = '15px';
        iconholder.style.height          = '15px';
        iconholder.style.borderRadius    = '2px';
        iconholder.style.marginLeft      = '2px';
        iconholder.style.marginTop       = '3px';
        iconholder.style.display         = 'inline-block';
        icon.style.marginTop             = '-4px';
        icon.innerHTML                   = '&#9888'; /* warning icon */	
        text.style.display               = 'inline-block';
        text.innerHTML = message;
        element.appendChild(iconholder);
        iconholder.appendChild(icon);
        element.appendChild(text);
        element.style.position        = 'absolute';
        element.style.left            = (e.target.getBoundingClientRect().left) + 'px';		
        element.style.top             = (e.target.getBoundingClientRect().bottom + 3) + 'px';
        element.style.width           = '450px';
        element.style.height          = '20px';
        element.style.display         = 'block';
        element.style.zIndex          = '99';
        setAnimation(element, 'fadein 0.5s, fadeout 0.5s 2.5s');

        // After 3 seconds, remove the show class from DIV
        setTimeout(() => {
          element.innerHTML     = '';
          element.style.display = 'none';
          setAnimation(element, '');
        }, 2500);
      }; 	  
	  
      const testAttributesValidity = element => { 	  
        if (element.hasAttribute('decimalSeparator') && !element.hasAttribute('numDecimals')) {
          setConfigError(element, 'numDecimals attribute should be set for elements with a defined decimalSeparator.');
          return 0;
        }
        return maxDigitsInFormat(element);
      };		
			
      const thousandsSeparator = element => 
        element.hasAttribute('thousandsSeparator') ? element.getAttribute('thousandsSeparator') : thousandsSeparatorDefault();
	  
      const thousandsSeparatorDefault = () => decimalSeparatorDefault() === ',' ? '.' : ',';	  

      const updatethousandsSeparators = e => { 
        const elementValueOrg    = e.target.value;
        let   [intPart, decPart] = e.target.value.split(decimalSeparator(e.target));
        		
        if (isNegative(e.target.value)) {
          intPart = intPart.substring(1);
        }  

        intPart = removeThousandsSeparators(e.target, intPart); 
		
        if (intPart.length > 3) {
          intPart = addThousandsSeparators(e, intPart);
        }
		
        e.target.value = (isNegative(e.target.value) ? '-' : '') + intPart + 
                         (decPart !== undefined ? decimalSeparator(e.target) + decPart : '') 

        if (isDeleteKey(e)) { 
          return numThousandsSeparators(e.target, e.target.value) - numThousandsSeparators(e.target, elementValueOrg);
        }
        if (e.key === 'Backspace') { 
          return numThousandsSeparators(e.target, e.target.value) - numThousandsSeparators(e.target, elementValueOrg) - 1;
        }
        return numThousandsSeparators(e.target, e.target.value) - numThousandsSeparators(e.target, elementValueOrg) + 1;       
      };
	  
      const validatePasteValue = e => {
        if (!isWholeValueSelected(e)) {
          return 'Paste only allowed when the current value is selected';
        } 
        if (!e.target.hasAttribute('allowNegativeSign') && e.clipboardData.getData('text/plain').startsWith('-')) {
          return 'Clipboard contains a negative value, this is not allowed';
        }		
        if (clipboardContainsDisallowedCharacters(e) 
            || (e.target.hasAttribute('allowNegativeSign') && e.clipboardData.getData('text/plain').lastIndexOf('-') > 0)) {
          return 'Clipboard contains invalid characters';
        } 
        if (e.clipboardData.getData('text/plain').startsWith(thousandsSeparator(e.target)) || 
            e.clipboardData.getData('text/plain').startsWith(decimalSeparator(e.target))) {
          return 'Clipboard value should start with a digit'; 
        }
        if (!numDigitsInClipboardAllowed(e)) {
          return 'Clipboard contains more digits than allowed (' + maxDigitsInFormat(e.target) + ')';
        }
        if (isInputWithDecimals(e)) {
          if (numDecimalsInClipboard(e) > numDecimalsInFormat(e.target)) {
            return 'No more than ' + numDecimalsInFormat(e.target) + ' decimals allowed in clipboard';
          }
          if (numIntegersInClipboard(e) > maxIntegersInFormat(e.target)) {
            return 'No more than ' + maxIntegersInFormat(e.target) + ' whole number digits allowed in clipboard';
          }
        }
        else {
          if (!numDecimalsInClipboard(e) === 0) {
            return 'Clipboard contains decimals, this is not allowed';
          }
        }
        return '';
      };	  
	  
      export {run};