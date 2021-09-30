let coursesOpened = false;
let skillsOpened = false;

function resume(){
    let url = window.location.href;
    window.location.replace("https://cyruslo.co/assets/Resume.pdf");
}

function sendEmail(){
    console.log("Submiting Message");
    email = document.getElementById("email").value;
    message = document.getElementById("message").value;
    body = "From: "+email+"\nMessage: "+message;
    
    Email.send({
        SecureToken:"a61bf697-e600-4199-a647-9fb5a76566be",
        To : 'chakwah09@yahoo.com.hk',
        From : "cyruslo5028@cyruslo.co",
        Subject : "You got a message from your Website.",
        Body :body ,
        }).then(
            message => alert("mail sent successfully")
        );
}

function openCourse(){
    content = document.getElementById("courses");
    coursesOpened = !coursesOpened;
    if(!coursesOpened){
        content.style.display = "none";
    }
    else{
        content.style.display = "block";
    }
}

function openSkills(){
    content = document.getElementById("skillsContent");
    skillsOpened = !skillsOpened;
    if(!skillsOpened){
        content.style.display = "none";
    }
    else{
        content.style.display = "block";
    }
}