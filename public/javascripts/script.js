


function CFtoggleDropdown() {
    var dropdownContent = document.querySelector('.dropdown-content');
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
}


// for current date for formula Createion 
document.addEventListener('DOMContentLoaded', function () {
    const dateInput = document.getElementById('dateInput');
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    dateInput.value = formattedDate;
    dateInput.min = `${year}-${month}-${day - 7}`;
    dateInput.max = `${year}-${month}-${day - -7}`;
});


// Admin side Add Category Form
function OpenCategoryAddingForm() {
    const popupContainer = document.getElementById('ADpopupContainer');
    popupContainer.style.display = 'flex';
}

function closeCategoryAddingForm() {
    const popupContainer = document.getElementById('ADpopupContainer');
    popupContainer.style.display = 'none';
}

// Error while adding Category;
// if (AddError) {
//     alert(AddError);
// }


function ADcategorySelect() {

    const categoryName = document.getElementById('CategorySelect');
    const selectedCategoryId = categoryName.value;

    if (!selectedCategoryId) {
        // ajax 
        function getAllSubCategories() {
            fetch('/admin/Subcategories/api')
                .then(response => response.json())
                .then(subCategories => {
                    // Process the retrieved subcategories
                    // console.log(subCategories);
                    // AllSubCategory = subCategories
                    displayFilteredSubCategories(subCategories)
                    // Call a function to display the subcategories in the table
                    // displaySubCategories(subCategories);
                })
                .catch(error => {
                    console.log('Error:', error);
                });
        }

        // Call the function to get all subcategories from the backend
        getAllSubCategories();
    } else {
        // ajax 
        function getAllSubCategories() {
            fetch('/admin/Subcategories/api')
                .then(response => response.json())
                .then(subCategories => {
                    // Process the retrieved subcategories
                    // console.log(subCategories);
                    // AllSubCategory = subCategories
                    FilterSubbCategory(subCategories)
                    // Call a function to display the subcategories in the table
                    // displaySubCategories(subCategories);
                })
                .catch(error => {
                    console.log('Error:', error);
                });
        }

        // Call the function to get all subcategories from the backend
        getAllSubCategories();

        function FilterSubbCategory(AllSubCategory) {
            const categoryName = document.getElementById('CategorySelect');
            // Filter the subcategories based on the selected category ID
            // console.table(AllSubCategory)
            var subCategories = AllSubCategory;
            const filteredSubCategories = subCategories.filter(subCategory => subCategory.Category_Id === selectedCategoryId);
            displayFilteredSubCategories(filteredSubCategories)
           
            // Print the filtered subcategories
            // console.table(filteredSubCategories);

            // Assume the filteredSubCategories variable holds the filtered subcategories
        }

    }

    // // Call the function to display the filtered subcategories initially
    function displayFilteredSubCategories(filteredSubCategories) {
        const tableBody = document.querySelector('#tableBody'); // Assuming you have added an id "tableBody" to the <tbody> element

        // Clear the existing table body
        tableBody.innerHTML = '';

        // Check if filtered subcategories exist
        if (filteredSubCategories.length > 0) {
            // Iterate over each filtered subcategory and create table rows
            filteredSubCategories.forEach(subCategory => {
                const row = document.createElement('tr');
                row.innerHTML = `
        <td>${subCategory.SubCategory_Id}</td>
        <td>${subCategory.SubCategory}</td>
        <td>${subCategory.Category_Id} - ${subCategory.Category}</td>
        <td><a href="" class="btn btn-primary">Edit</a></td>
        `;
                tableBody.appendChild(row);
            });
        } else {
            // Display a message when no filtered subcategories are available
            const row = document.createElement('tr');
            row.innerHTML = `
        <td class="ADSubCategoryNotAvailable" colspan="4">No Sub Category is Added</td>
        `;
            tableBody.appendChild(row);
        }
    }



}