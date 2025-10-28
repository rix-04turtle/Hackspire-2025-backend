async function getAllUsers(req, res) {

    await f2();
    await f1();


    // Fetch user list from database or service 
    res.send('User list');
}

function f1() {
    console.log("This is f1");
}

async function f2() {
    await new Promise(resolve => setTimeout(resolve, 3000)); //3s

    console.log("This is f2");
}

module.exports = getAllUsers;