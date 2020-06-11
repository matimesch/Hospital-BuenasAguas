const form = document.getElementById("form");
const medicamento = document.getElementById("medicamento");
const via = document.getElementById("via");
const lista = document.getElementById("lista");

const requestPeople = (medicamento,via) => {
    const ajaxRequest = new XMLHttpRequest();

    ajaxRequest.addEventListener("load", function () {
        if (this.status == 200) {
            const resultData = JSON.parse(this.responseText);
            lista(resultData);
        };
    });

    ajaxRequest.open("GET", `/medicamentos?medicamento=${medicamento}&via=${via}`);
    ajaxRequest.send();
};

form.addEventListener("submit", (event) => {    
    event.preventDefault();
    requestPeople(medicamento.value,via.value);
})

function lista(medicamentos) {
    container.innerHTML = "";
    const newUl = document.createElement("ul");
    for (let i = 0; i < medicamentos.length; i++) {
        const medicamento = medicamentos[i];
        const newLi = document.createElement("li");
        newLi.innerText = `${medicamento.medicamento}, ${medicamento.via}`;
        newUl.appendChild(newLi);
    }
    container.appendChild(newUl);
}