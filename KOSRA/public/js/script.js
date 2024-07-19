
  function calculatePrice() {
    const hotelType = document.getElementById('hotelType').value;
    const rooms = parseInt(document.getElementById('rooms').value, 10);

    const prices = {
        standard:1500,
        deluxe: 2500,
        suite: 3500,
    };

    const pricePerRoom = prices[hotelType] || 0;
    const totalPrice = pricePerRoom * rooms;

    document.getElementById('totalPrice').textContent = totalPrice;
}

function validateForm() {
    const hotelType = document.getElementById('hotelType').value;
    const adults = parseInt(document.getElementById('adults').value, 10);
    const children = parseInt(document.getElementById('children').value, 10);
    const rooms = parseInt(document.getElementById('rooms').value, 10);

    const maxCapacity = {
        standard: { adults: 2, children: 1 },
        deluxe: { adults: 2, children: 2 },
        suite: { adults: 4, children: 4 },
    };

    const maxAdults = maxCapacity[hotelType].adults;
    const maxChildren = maxCapacity[hotelType].children;

    const totalAdultsAllowed = maxAdults * rooms;
    const totalChildrenAllowed = maxChildren * rooms;

    const errorMessageElement = document.getElementById('errorMessage');
    if (adults > totalAdultsAllowed) {
        errorMessageElement.textContent = `For ${rooms} room(s), maximum ${totalAdultsAllowed} adults are allowed in ${hotelType} type.`;
        return false;
    }

    if (children > totalChildrenAllowed) {
        errorMessageElement.textContent = `For ${rooms} room(s), maximum ${totalChildrenAllowed} children are allowed in ${hotelType} type.`;
        return false;
    }

    errorMessageElement.textContent = '';
    return true;

    
}

// Initial calculation to set the price when the page loads
document.addEventListener('DOMContentLoaded', () => {
    calculatePrice();
    validateForm();
});


document.addEventListener("DOMContentLoaded", function () {
    const today = new Date().toISOString().split('T')[0];
    const checkInDate = document.getElementById("checkInDate");
    const checkOutDate = document.getElementById("checkOutDate");

    checkInDate.setAttribute("min", today);
    checkOutDate.setAttribute("min", today);

    checkInDate.addEventListener("change", function() {
        checkOutDate.setAttribute("min", this.value);
        if (checkOutDate.value < this.value) {
            checkOutDate.value = this.value;
        }
    });

    checkOutDate.addEventListener("change", function() {
        if (this.value < checkInDate.value) {
            this.value = checkInDate.value;
        }
    });

    
});

