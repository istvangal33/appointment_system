document.addEventListener("DOMContentLoaded", function () {
  const business = document.getElementById("business").value;

  flatpickr("#date", {
    dateFormat: "Y-m-d",
    minDate: "today",
    onChange: function (selectedDates, dateStr) {
      fetchAvailableTimes(business, dateStr);
    }
  });

  function fetchAvailableTimes(business, date) {
    fetch(`/api/available-times/?business=${business}&date=${date}`)
      .then(response => response.json())
      .then(data => {
        const timeSelect = document.getElementById("time");
        timeSelect.innerHTML = '<option value="">Válassz időpontot</option>';
        data.times.forEach(time => {
          const option = document.createElement("option");
          option.value = time;
          option.textContent = time;
          timeSelect.appendChild(option);
        });
      });
  }

  document.getElementById("bookingForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {
      business: business,
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
      date: document.getElementById("date").value,
      time: document.getElementById("time").value
    };

    fetch('/api/book-appointment/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
      if (response.status === 'success') {
        document.getElementById("confirmation").classList.remove("d-none");
        document.getElementById("bookingForm").reset();
      }
    });
  });
});
