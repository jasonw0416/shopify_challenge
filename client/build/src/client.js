const sock = io();


// send 'create' signal to the server
const create = (e) => {
    e.preventDefault();
    const input = document.querySelector('#create-chat');
    const text = input.value.trim();
    input.value = '';

    const input1 = document.querySelector('#create-price');
    const text1 = input1.value;
    input1.value = '';

    const input2 = document.querySelector('#create-description');
    const text2 = input2.value.trim();
    input2.value = '';

    const input3 = document.querySelector('#create-stock');
    const text3 = input3.value.trim();
    input3.value = '';

    if ((text == "") || (text1 == "") || (text2 == "") || (text3 == "")){
        alert("all fields are required to be filled in");
    }
    else{
        sock.emit('create', text, text1, text2, text3);
    }
}
document
    .querySelector('#create-form')
    .addEventListener('submit', create);


// send 'delete' signal to the server
const del = (e) => {
    e.preventDefault();
    const input = document.querySelector('#delete-chat');
    const text = input.value.trim();
    input.value = '';

    const input1 = document.querySelector('#deletion-comment');
    const text1 = input1.value.trim();
    input1.value = '';

    sock.emit('delete', text, text1);
}
document
    .querySelector('#delete-form')
    .addEventListener('submit', del);

// send 'update' signal to the server
const update = (e) => {
    e.preventDefault();
    const input1 = document.querySelector('#update-chat1');
    const text1 = input1.value.trim();
    input1.value = '';
    
    const input2 = document.querySelector('#update-chat2');
    const text2 = input2.value.trim();
    input2.value = '';

    const input3 = document.querySelector('#update-price');
    const text3 = input3.value;
    input3.value = '';

    const input4 = document.querySelector('#update-description');
    const text4 = input4.value.trim();
    input4.value = '';

    const input5 = document.querySelector('#update-stock');
    const text5 = input5.value.trim();
    input5.value = '';

    if ((text2 == "") && (text3 == "") && (text4 == "") && (text5 == "")){
        alert("Please add a new information to update");
    }
    else{
        sock.emit('update', text1, text2, text3, text4, text5);
    }
}
document
    .querySelector('#update-form')
    .addEventListener('submit', update);

// createTable function used for both inventory list (deleted or present items)
function createTable(data, deletedTable) {
    var table = document.createElement("table");
    var tBody = document.createElement("tbody");

    var tr1 = document.createElement("tr");

    var th1 = document.createElement("th");
    var thText1 = document.createTextNode("Title");
    th1.appendChild(thText1);

    var th2 = document.createElement("th");
    var thText2 = document.createTextNode("Price");
    th2.appendChild(thText2);

    var th4 = document.createElement("th");
    var thText4 = document.createTextNode("Stock");
    th4.appendChild(thText4);

    var th3 = document.createElement("th");
    var thText3 = document.createTextNode("Description");
    th3.appendChild(thText3);

    tr1.appendChild(th1);
    tr1.appendChild(th2);
    tr1.appendChild(th4);
    tr1.appendChild(th3);

    if (deletedTable) {
        var th5 = document.createElement("th");
        var thText5 = document.createTextNode("Deletion Comment");
        th5.appendChild(thText5);

        tr1.appendChild(th5);
    }

    tBody.appendChild(tr1);


    data.forEach(datum => {
        var tr = document.createElement("tr");

        var td1 = document.createElement("td");
        var tdText1 = document.createTextNode(datum.title);
        td1.appendChild(tdText1);

        var td2 = document.createElement("td");
        var tdText2 = document.createTextNode(datum.price);
        td2.appendChild(tdText2);

        var td4 = document.createElement("td");
        var tdText4 = document.createTextNode(datum.stock);
        td4.appendChild(tdText4);

        var td3 = document.createElement("td");
        var tdText3 = document.createTextNode(datum.description);
        td3.appendChild(tdText3);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td4);
        tr.appendChild(td3);

        if (deletedTable) {
            var td5 = document.createElement("td");
            var tdText5 = document.createTextNode(datum.deletionComment);
            td5.appendChild(tdText5);

            tr.appendChild(td5);
        }

        tBody.appendChild(tr);
    });

    table.appendChild(tBody);

    return table;
}

// received data (present items) from server which is from the database MongoDB
sock.on('listed', (data) => {
    if (data.length > 0){
        
        table = createTable(data, false);

        const parent = document.querySelector('#tables');
        parent.innerHTML = "";

        parent.appendChild(table);
    }
    else {
        const parent = document.querySelector('#tables');
        parent.innerHTML = "";
    }
    
});

// received data (deleted items) from server which is from the database MongoDB
sock.on('deletedList', (data) => {
    if (data.length > 0){
        
        table = createTable(data, true);

        const parent = document.querySelector('#deletedTables');
        parent.innerHTML = "";

        parent.appendChild(table);
    }
    else {
        const parent = document.querySelector('#deletedTables');
        parent.innerHTML = "";
    }
})


// send 'undelete' signal to the server
const undel = (e) => {
    e.preventDefault();
    const input = document.querySelector('#undelete-chat');
    const text = input.value.trim();
    input.value = '';

    sock.emit('undelete', text);
}
document
    .querySelector('#undelete-form')
    .addEventListener('submit', undel);


// title for the new item already exist
sock.on('title-exists', () => {
    alert("The title that you wish to create already exists");
});

// received signal from the server that the request was successfully created
sock.on('created', () => {
    alert("successfully created");
});

// received signal from the server that the request was successfully deleted
sock.on('deleted', () => {
    alert("successfully deleted");
});

// title for the requested item does not exist
sock.on('title-dne', () => {
    alert("the title does not exist");
});




