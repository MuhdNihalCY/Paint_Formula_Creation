  //Version. 1.0
  function SearchFromForm() {
    // Get values from the input fields
    const startDate = formatDateToApiFormat(document.getElementById("StartDate").value);
    const endDate = formatDateToApiFormat(document.getElementById("EndDate").value);
    const customerName = document.getElementById("customerName").value;
    const colorCode = document.getElementById("colorCode").value;
    const colorName = document.getElementById("colorName").value;
    const dateRange = document.getElementById("DateRange").value;

    // console.log("StartDate: ", startDate);
    // console.log("EndDate: ", endDate);


    // Check if any of the variables are empty
    if (
        //startDate === "" &&
        //endDate === "" &&
        customerName === "" &&
        colorCode === "" &&
        colorName === "" &&
        dateRange === ""
    ) {
        // Display an alert if any of the variables are empty
        alert("Please fill in all the data.");
        return; // Stop further processing
    }

    // version 1.0
    /*// Filter the Formulations array based on the search criteria
    const SearchedFormula = Formulations.filter(formulation => {
        const formulationDate = new Date(formulation.Date);
        const searchStartDate = new Date(startDate);
        const searchEndDate = new Date(endDate);

        // Function to compare only the date parts (year, month, and day) of two dates
        function compareDatesOnly(date1, date2) {
            return (
                date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate()
            );
        }

        // Check if the date falls within the search range
        const dateInRange = (
            compareDatesOnly(formulationDate, searchStartDate) ||
            compareDatesOnly(formulationDate, searchEndDate) ||
            (formulationDate > searchStartDate && formulationDate < searchEndDate)
        );

        // Check if the customerName, colorCode, and colorName match the search criteria
        const customerNameMatch = customerName && formulation.CustomerName.includes(customerName);
        const colorCodeMatch = colorCode && formulation.ColorCode === colorCode;
        const colorNameMatch = colorName && formulation.ColorName.includes(colorName);

        // Return true if the formulation matches any of the search criteria
        return dateInRange || customerNameMatch || colorCodeMatch || colorNameMatch;
    });*/


    //version 2.0
    // Filter the Formulations array based on the search criteria
    let SearchedFormula = Formulations;

    // Check customerName and filter if there's a value
    if (customerName !== "") {
        SearchedFormula = SearchedFormula.filter(formulation => formulation.CustomerName.includes(customerName));
    }

    // Check colorCode and filter if there's a value
    if (colorCode !== "") {
        SearchedFormula = SearchedFormula.filter(formulation => formulation.ColorCode === colorCode);
    }

    // Check colorName and filter if there's a value
    if (colorName !== "") {
        SearchedFormula = SearchedFormula.filter(formulation => formulation.ColorName.includes(colorName));
    }

    // Check dateRange and filter if there's a value
    if (dateRange !== "") {
        SearchedFormula = SearchedFormula.filter(formulation => {
            const formulationDate = new Date(formulation.Date);
            return formulationDate.toDateString() === new Date(dateRange).toDateString();
        });
    }

    // Check dateRange and filter if there's a value
    if (dateRange !== "") {
        SearchedFormula = SearchedFormula.filter(formulation => {
            const formulationDate = new Date(formulation.Date);
            const searchStartDate = new Date(startDate);
            const searchEndDate = new Date(endDate);
            alert("s");

            // Function to compare only the date parts (year, month, and day) of two dates
            function compareDatesOnly(date1, date2) {
                return (
                    date1.getFullYear() === date2.getFullYear() &&
                    date1.getMonth() === date2.getMonth() &&
                    date1.getDate() === date2.getDate()
                );
            }

            // Check if the date falls within the search range
            const dateInRange = (
                compareDatesOnly(formulationDate, searchStartDate) ||
                compareDatesOnly(formulationDate, searchEndDate) ||
                (formulationDate > searchStartDate && formulationDate < searchEndDate)
            );

            return dateInRange;
        });
    }


    // Call the populateTable function with the filtered results
    var SerachREsultCount = document.getElementById('SerachREsultCount');
    SerachREsultCount.style.display = "Flex";
    SerachREsultCount.textContent = SearchedFormula.length + " Records Found!"
    populateTable(SearchedFormula);


}




 // Function to compare only the date parts (year, month, and day) of two dates
    /*  function compareDatesOnly(date1, date2) {
          alert("ds");
          if (
              date1.getFullYear() === date2.getFullYear() &&
              date1.getMonth() === date2.getMonth() &&
              date1.getDate() === date2.getDate()
          ) {
              console.log("true");
          } else {
              console.log("False");
          }
          return (
              date1.getFullYear() === date2.getFullYear() &&
              date1.getMonth() === date2.getMonth() &&
              date1.getDate() === date2.getDate()
          )
      }
  */

  


      
// // /* Create Fromula */

// .containerForCF {
//     width: 100%;
//     padding-left: 2rem;
//     padding-right: 2rem;
//   }
  
//   .CFBorder {
//     border: 3px solid gray;
//     width: 100%;
//   }
  
//   .Cf_Header_Area {
//     width: 100%;
//     height: 8rem;
//     border: 1px solid gray;
//     display: flex;
//     justify-content: end;
//   }
  
//   .MixerDetails {
//     display: flex;
//     align-items: center;
//   }
  
//   .Cf_Header_Area_Buttons {
//     height: 100%;
//     display: flex;
//     align-items: center;
//     justify-content: end;
//   }
  
//   .Cf_Header_Area_Buttons_EachOne {
//     margin: 10px 10px;
//     width: 150px;
//     border: #242424 2px solid;
//     height: 50px;
//     text-align: center;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     background-color: rgb(17, 21, 28);
//     color: whitesmoke;
//     font-size: 18px;
//   }
  
//   .Cf_Header_Area_Buttons_EachOne:hover {
//     font-weight: 600;
//     background-color: rgb(7, 12, 81);
//     color: aliceblue;
//   }
  
//   .CFClearAllBTN {
//     text-decoration: none;
//   }
  
//   .CFClearAllBTN:hover {
//     color: whitesmoke;
//   }
  
//   .CFHeaderDiv {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     height: 100%;
//   }
  
//   .CFHeaderLable {
//     font-size: 35px;
//     font-weight: 700;
//   }
  
//   .CFdropdown {
//     position: relative;
//     display: inline-block;
//   }
  
//   .CFdropdown-button {
//     width: 150px;
//     height: 50px;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     padding-top: 15px;
//     background-color: #434343;
//     color: whitesmoke;
//     font-size: 18px;
//   }
  
//   .CFdropdown-content {
//     display: none;
//     position: absolute;
//     background-color: #f9f9f9;
//     min-width: 160px;
//     box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
//     z-index: 1;
//   }
  
//   .CFdropdown-content button {
//     color: black;
//     padding: 12px 16px;
//     display: block;
//     width: 100%;
//   }
  
//   .CFdropdown:hover .CFdropdown-content {
//     display: block;
//   }
  
//   .BasicDetailsMainDiv {
//     width: 100%;
//   }
  
//   .BasicDetails {
//     margin: 3rem 0;
//     display: flex;
//     /* background-color: red; */
//     width: 100%;
//     height: 15rem;
//   }
  
//   .BasicDetailsLeftSection {
//     width: 33%;
//     height: 15rem;
//     border: 1px solid gray;
//     border-top-color: transparent;
//     border-left-color: transparent;
//     border-bottom-color: transparent;
//     display: flex;
//     flex-direction: column;
//     /* background-color: black; */
//   }
  
//   .BasicDetailsCenterSection {
//     width: 34%;
//     height: 15rem;
//     display: flex;
//     flex-direction: column;
//     /* background-color: rgb(48, 48, 48); */
//   }
  
//   .BasicDetailsRightSection {
//     width: 33%;
//     height: 15rem;
//     border: 1px solid gray;
//     border-top-color: transparent;
//     border-right-color: transparent;
//     border-bottom-color: transparent;
//     display: flex;
//     flex-direction: column;
//     /* background-color: rgb(158, 158, 158); */
//   }
  
//   .CFDateDiv,
//   .CFFileNODiv,
//   .CFProjectNoDiv,
//   .CFCustomerNameDiv,
//   .CFCustomerRefDiv,
//   .CFColorCodeDiv,
//   .CFColorNameDiv {
//     display: flex;
//     flex-direction: row;
//     margin: 1rem 2rem;
//     margin-left: 0;
//     justify-content: space-between;
//   }
  
//   .CFDateDiv p,
//   .CFFileNODiv p,
//   .CFProjectNoDiv p,
//   .CFCustomerNameDiv p,
//   .CFCustomerRefDiv p,
//   .CFColorCodeDiv p,
//   .CFColorNameDiv p {
//     margin: 1rem 2rem;
//     font-size: 20px;
//     font-weight: 700;
//   }
  
//   .BasicDetails input[type="date"],
//   [type="text"] {
//     width: 50%;
//     font-size: 20px;
//     font-weight: 700;
//     padding-left: 1rem;
//   }
  
//   .BasicDetailsEndHR {
//     margin-top: 2rem;
//   }
  
//   .CFSelectionHeader {
//     display: flex;
//     flex-direction: row;
//     justify-content: end;
//     margin-top: 3rem;
//   }
  
//   .CFSelectCategory,
//   .CFSelectSubCategory {
//     width: 100%;
//     display: flex;
//     flex-direction: row;
//     margin-left: 4rem;
//     justify-content: center;
//     align-items: center;
//     margin-bottom: 5rem;
//   }
  
//   .CFSelectCategoryLabel,
//   .CFSelectSubCategoryLabel {
//     margin: 1rem 2rem;
//     font-size: 20px;
//     font-weight: 700;
//   }
  
//   .CFCategory,
//   .CFSubCategory {
//     width: 60%;
//     font-size: 20px;
//     font-weight: 600;
//     padding-left: 1rem;
//     padding: 1rem 1rem;
  
//   }
  
  
//   /* create formula table */
//   .MainMixingTableDiv {
//     margin-top: -2rem;
//     margin-bottom: 3rem;
//   }
  
//   .CFTableHeadRow {
//     background-color: gray;
//     color: whitesmoke;
//     font-size: 20px;
//     font-weight: 500;
//   }
  
//   table,
//   th,
//   td {
//     border: 1px solid black;
//     border-collapse: collapse;
//     padding: 5px;
//     text-align: center;
//   }
  
//   .CFTableRowData {
//     padding: 1rem 0;
//   }
  
//   .AddIcon {
//     width: 15px;
//     height: 15px;
//     margin-left: 1rem;
//   }
  
//   .CFBindersAndAdditivesUnits {
//     display: flex;
//     width: 100%;
//     justify-content: end;
//   }
  
//   .CFeachUnit {
//     width: 136px;
//     margin-left: 0rem;
//   }
  
//   .CFUnitsTotal {
//     font-size: 15px;
//     font-weight: 600;
//   }
  
//   .CFTotalInputElements {
//     margin-left: 2rem;
//   }
  
//   .CFTotalWithoutAdditives {
//     /* border: 1px solid rgba(0, 0, 0, 0.529); */
//     border-top: transparent;
//     width: 48%;
//     display: flex;
//     align-items: center;
//     height: 68px;
//   }
  
//   .CFTotalWithoutAdditivesLabel {
//     height: 100%;
//     border-top: transparent;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     width: 42%;
//     /* border: 1px solid rgba(0, 0, 0, 0.319); */
//   }
  
//   .CFTotalWithoutAdditivesinGrams,
//   .CFTotalWithoutAdditivesinVolume {
//     height: 100%;
//     width: 29%;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//   }
  
//   .CFBulkConverstedTableandBindersAndAdditives {
//     display: flex;
//     justify-content: space-between;
//     align-items: start;
//     width: 100%;
//   }
  
//   .CFBinderHead {
//     display: flex;
//     justify-content: space-between;
//   }
  
//   .CFBindersAndAdditives {
//     width: 49%;
//     border: 1px solid rgba(0, 0, 0, 0.319);
//     padding: 1rem;
//   }
  
//   .CFBinder1Div,
//   .CFBinder2Div {
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//   }
  
//   .CFBindersHeading {
//     font-size: 20px;
//     font-weight: 600;
//   }
  
//   .CFBinderName {
//     font-size: 18px;
//     font-weight: 500;
//   }
  
//   .CFBinder1Div input[type="text"],
//   .CFBinder2Div input[type="text"] {
//     width: 150px;
//     text-align: center;
//   }
  
//   .CFTotalCalcDiv {
//     margin-left: 2rem;
//   }
  
//   .CFSelectAdditives {
//     width: 200px;
//     padding: 1rem;
//     margin-top: -1rem;
//     font-size: 18px;
//     font-weight: 500;
//   }
  
//   .CFSelectAdditivesDiv {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     margin-bottom: 1rem;
//   }
  
//   .CFSelectAdditivesDiv p {
//     margin-top: 1rem;
//   }
  
//   .CFTotalWithAdditives {
//     display: flex;
//     flex-direction: column;
//   }
  
//   .CFTotalWithAddUnit {
//     display: flex;
//     justify-content: end;
//   }
  
//   .CFTotalWithAddAndBinder {
//     display: flex;
//     justify-content: space-between;
//   }
  
//   .CFtotalwithAddValuesDiv {
//     display: flex;
//   }
  
//   .CFtotalwithAddValues {
//     width: 200px;
//     text-align: center;
//     margin-left: 2rem;
//   }
  
//   .CFBulkConvertionTable {
//     width: 50%;
//   }
  
//   .CFsolidContentCalcDivArea {
//     margin-top: 0rem;
//     width: 49%;
//     border: 1px solid rgba(0, 0, 0, 0.319);
//     padding: 2rem 1rem;
//   }
  
//   .CFsolidContentCalcDiv {
//     width: 100%;
//     display: flex;
//     justify-content: space-between;
//     padding: 1rem 0;
//   }
  
//   .CFSolidContentInput {
//     width: 300px;
//     text-align: center;
//     margin-top: -10px;
//   }
  
//   .CFSolidContentInputNoLabel {
//     width: 350px;
//     text-align: center;
//     margin-top: -10px;
//     height: 45px;
//   }
  
//   .CFsolidContentCalcDivNoLabel {
//     width: 100%;
//     display: flex;
//     justify-content: end;
//     padding: 1rem 0;
//   }
  
//   .CFRemark {
//     margin-top: 3rem;
//     width: 40%;
//     border: 1px solid rgba(0, 0, 0, 0.319);
//     background-color: #6b6b6b;
//     border-radius: 5px;
//     margin-bottom: 5rem;
//   }
  
//   .CFRemarkHeading {
//     display: flex;
//     align-items: center;
//     padding: .5rem 1rem;
//     background-color: #414141;
//     width: 100%;
//     color: white;
//     font-size: 18px;
//     font-weight: 600;
//   }
  
//   .CFRemarkHeading p {
//     margin-top: 1rem;
//   }
  
//   .CFRemarksDIv {
//     height: 6rem;
//     padding: 1rem;
//     color: whitesmoke;
//     width: 100%;
//   }
  
//   .CFslNo {
//     width: 1rem;
//   }
  
//   .CfTinders {
//     width: 10rem;
//   }
  
//   .GramInputTotal,
//   .LiterInputTotal,
//   .R1C1,
//   .R1C2,
//   .R1C3,
//   .R1C4,
//   .R1C5,
//   .R1C6 {
//     border: none;
//     background-color: transparent;
//     /*transparent;*/
//     outline: none;
//     width: 4rem;
//     font-size: 15px;
//     font-weight: 500;
//   }
  
//   .GramInputTotal,
//   .LiterInputTotal {
//     width: 7rem;
//   }
  
//   .CFTinters {
//     background-color: transparent;
//     font: 30px;
//     font-weight: 600;
//     width: 10rem;
//     padding: 1rem 1rem;
//     border: none;
//   }
  
//   .CFInputTotal {
//     font-size: 1.4rem;
//   }
  
//   .CFInpValue {
//     font-size: 1.2rem;
//     border-bottom: 1px solid black;
//   }
  
//   .CFTotalInputElementsGrams,
//   .CFTotalInputElementsLiter {
//     width: auto;
//   }
  
//   #TotalQtyInGram,
//   #TotalQtyInLiter {
//     width: 180px;
//     background-color: transparent;
//     text-align: center;
//   }
  
//   #TotalAdditives {
//     width: 50%;
//   }
  
  
//   #CFRemarks {
//     background-color: transparent;
//     width: 100%;
//     border: none;
//     color: whitesmoke;
//     font-size: 20px;
//   }
  
  
//   .readonly-input {
//     outline: none;
//     border: none;
//     background-color: rgba(224, 224, 224, 0.255);
//     padding: 1rem 0;
//     text-align: center;
//     /* Add more styles as needed */
//   }
  
//   .CFAllDiv {
//     margin-bottom: 10rem;
//   }
  
  
  
  
  
  
//   /* Creating formula Ends */