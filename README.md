          This is a test / demo html file with javascript to handle a configurable input field for decimals. It works in
          at least the newest versions of Chrome, Firefox and Edge
          Configurable with HTML attributes in the decimal input field are:
          - numDecimals
          - maxDigits
          - decimalSeparator
          - thousandsSeparator
          - allowNegativeSign 
	  
          Design choices:
          - The selectionStart is taken as the cursor position in the following requirements
          - Formatting only takes place on keydown and paste for an optimal user experience
          - For maximum configurability the text input is used instead of number input
          - Configuration errors are indicated by coloring the inputfield red and assign it a tooltip with an errormessage
          - Fields for decimal input are marked with class='decimal'
          - maxDigits is a mandatory attribute for decimal input fields, the value should be > 0
          - If numDecimals > 0 maxDigits should be greater than numDecimals
          - If numDecimals > 0 the initial value shows numDecimals zero's right of the separator, one zero left of it
          - With all keydown and paste actions with the selectionstart position in the integer part thousands separators have to appear in the right positions
          - If no constraint is met the input is rejected (not printed)
          - If input is rejected on paste a validation message appears for three seconds
		  
          Requirements:

          - Behaviour on delete keydown
            With nothing selected
            - If the cursor is in the decimalpart change the value of the digit in zero and move the cursor one position to the right
            - If the cursor is in the integer part and left of the decimalSeparator or a thousandsSeparator move the cursor one position to the right
            - If the cursor is in the integer part, left of the only digit in the integer part change the value to zero and don't move the cursor
            - If the cursor is in the integer part, left of a digit which is not the only one in the integer part remove the digit and don't move the cursor
            With a selection
            - If the whole value is selected change the value to the default, the cursor should be left of the value
            - If the whole integerpart is selected replace it with a zero, put the cursor left of it
            - If a part of the integer- and decimalparts are selected replace the selected integer part with empty space and the selected decimals with zero's, don't move the cursor
	
          - Behaviour on backspace keydown
            With nothing selected  
            - If the cursor is in the decimal part and directly right of the decimalSeparator move the cursor one position to the left
            - If the cursor is in the integer part and right of a thousandsSeparator move the cursor one position to the left
            - If the cursor is in the integer part, on a position > 0 while there are > 1 digits in the integer part remove the digit and let the cursor at the same position
            - If the cursor is in the integer part, left of the decimalseparator / at the end of the integerpart of the number
              while there is 1 digit in the integer replace the digit with zero and move the cursor one position to the left
            - If after removal of a digit the integer part starts with more than one zero remove all zero's of the integer part except one, update the thousands-separators
            With a selection
            - Replace selected digits in the decimal part with zero
            - If the whole integerpart of the number is selected replace that part with zero and move the cursor to position zero
            - If a part of the integerpart is selected starting at position zero remove the selection and put the cursor to position zero
            - If a part of the integerpart is selected starting at a position that is not zero remove the selection. Put the cursor at the starting position of the removed part
		
          - Behaviour on decimalSeparator keydown
            - If the cursor is in the integer part move the cursor to the right of the decimalSeparator
		
          - Behaviour on digit keydown
            With nothing selected 
            - If the cursor is in the decimalpart replace the digit right of the cursor and put the cursor one position to the right
            - If the cursor is in the integer part on a position immediately left of the first digit and the integerpart value is zero (or -0) replace the zero and put the cursor one position to the right
            - If the cursor is in the integer part on a position immediately right of the first digit and the integerpart value is zero (or -0) replace the zero, cursor position not altered
            - If the cursor is in the integer part, on a position not left of the first digit, print the keyvalue, let the cursorposition the same
            - If the cursor is in the integer part on position zero and the keyvalue is zero no action follows (digit is not printed, cursor position not altered)
            With a selection
            - If the cursor is in the decimalpart replace the first selected with the typed digit, put the cursor right of the replaced digit
            - If the cursor is in the integer part, at position zero, keyvalue is zero and at least the whole integerpart is selected replace the integerpart with zero
              and put the cursor to position 1
            - If the cursor is in the integer part, at position zero, keyvalue is zero and less than the whole integerpart is selected the zero digit is not printed
              cursorposition stays the same		
            - If the cursor is in the integer part, at position zero, keyvalue is not zero replace the selected integerpart  with the typed digit one and put the cursor after
              the new digit
            - If the cursor is in the integer part, at a non-zero position and a digit is typed replace the selected integerpart with the typed digit one and put the cursor after
              the new digit

          - Behaviour on minus sign keydown (only if the attribute allowNegativeSign is set for the element)
            With nothing selected   
            - If the input value does not already start with a minus and the cursor is at position zero print the minus, put the cursor to the right of the minus
            - If the input value does start with a minus and the cursor is at position zero put the cursor to the right of the minus
            With a selection
            - If the selection starts at position zero, ends before the last integer digit while there are more than one digits in the integerpart 
              replace the selection with the minus, put the cursor after the minus
	 
          - Behaviour on select all
            This action is allowed	

          - Behaviour on cut 
            This action is disallowed for now 

          - Behaviour on copy
            This action is allowed 

          - Behaviour on paste 
            - A warning appears for three seconds when the action is not allowed  
            The paste is not allowed when
            - Not the whole input is selected
            - The clipboard value is not conform the input attribute values
            - The clipboard value contains invalid characters
            - The clipboard value does not start with a digit