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