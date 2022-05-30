let sotien = document.getElementById("sotien")

sotien.addEventListener('input', updateValue);

function updateValue(e) {
    let money = Number(sotien.value);
    document.getElementById('phirut').innerHTML = 'Phí rút: ' + (money * 5 / 100).toLocaleString() + '  VNĐ';
}