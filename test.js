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

  