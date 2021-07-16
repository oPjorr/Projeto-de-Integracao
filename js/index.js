const db = firebase.firestore()
let tasks = [] 
let currentUser = {}


function getUser() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser.uid = user.uid
            readTasks()
            let userLabel = document.getElementById("navbarDropdown")
            userLabel.innerHTML = user.email
        } else {
            swal.fire({
                icon: "success",
                title: "redirecionando para a tela de autenticação",
            }).then(() => {
                setTimeout(() => {
                    window.location.replace("login.html")
                }, 1000)
            })
        }
    })
}

function createDelButton(task) {
    const newButton = document.createElement("button")
    newButton.setAttribute("class", "btn btn-primary ml-3")
    newButton.appendChild(document.createTextNode("Excluir"))   
    newButton.setAttribute("onclick", `deleteTask("${task.id}")`)
    return newButton
}

function renderTasks() {
    let itemList =  document.getElementById("itemList")
    itemList.innerHTML = ""
    for (let task of tasks) {
        const newItem = document.createElement("li")
        newItem.setAttribute(
        "class", 
        "list-group-item d-flex justify-content-between",
        )
        newItem.appendChild(document.createTextNode(task.title))
        const span = document.createElement("span")
        if (task.date !== undefined) {
            const data = new Date(task.date)
            options = {dateStyle: "full"}
            const dataformatada = new Intl.DateTimeFormat("pt-BR", options).format(data)
            span.appendChild(document.createTextNode("Data de entrega: " + dataformatada))
        }
        span.appendChild(createDelButton(task))
        newItem.appendChild(span)
        itemList.appendChild(newItem)
    }
}


async function readTasks() {
    tasks = []
    const logTasks = await db.collection("tasks").where("owner", "==", currentUser.uid).get()
    for (doc of logTasks.docs) {
        tasks.push ({
            id: doc.id,
            title: doc.data().title,
            date: doc.data().date,
        })
    }
    renderTasks()
}

async function addTask() {
    const itemList = document.getElementById("itemList")
    const newItem = document.createElement("li")
    newItem.setAttribute("class", "list-group-item d-flex")
    newItem.appendChild(document.createTextNode("Registrando Nova Atividade..."))
    itemList.appendChild(newItem)

    const title = document.getElementById("newItem").value 
    const date = document.getElementById("datenewItem").value
    await db.collection("tasks").add({
        title: title,
        date: date,
        owner: currentUser.uid,
    })
    readTasks()
}

async function deleteTask(id) {
    await db.collection("tasks").doc(id).delete()
    readTasks()
}

window.onload = function() {
    getUser()
}

