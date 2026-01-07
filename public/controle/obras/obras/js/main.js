const optionNav = document.querySelectorAll(".optionNav");

optionNav.forEach(option => {
    option.addEventListener("click", evt => {
        
        optionNav.forEach(opt => {
            opt.classList = "optionNav closeOption";
        });

        evt.currentTarget.classList = "optionNav openOption";
    })
})

const tableBody = document.querySelector("#tableBody");

fetch('/getIOP', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        // Include any necessary data to be sent with the request
    })
}).then(response => response.json())
  .then(data => {
      // Process the response data
      console.log(data);

      // Update the table with the fetched data
      data.forEach(item => {
          const row = document.createElement("tr");
          row.innerHTML = `
          <th><button class="editButton" data-id="${item.id}">Edit</button></th>
              <td>${item.res_nota}</td>
              <td>${item.res_status}</td>
              <td>${item.res_cidade}</td>
              <td>${item.res_nome_obra}</td>
              <td>${item.res_data_exe}</td>
              <td>${item.res_resp}</td>
          `;
          tableBody.appendChild(row);
      });

  })
  .catch(error => {
      console.error('Error:', error);
  });