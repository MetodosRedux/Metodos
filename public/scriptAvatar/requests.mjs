/*   import { imageDataUrl } from "./main.mjs";
import { character } from "./scene.mjs";  */

const token = localStorage.getItem("token")


/* ------------- REGISTER ------------- */

const createUserForm = document.getElementById("createUserForm")
if(createUserForm){
createUserForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const username = document.getElementById("inputUsername").value;
      const email = document.getElementById("inputEmail").value;
      const pswHash = document.getElementById("inputPassword").value;
 

      const userData = { username, email, pswHash };

     
        try {
          let response = await fetch("/user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });

          if (response.status == 200) {

          
            localStorage.removeItem("token")
            window.location.href = "login.html"
          

          } else {
            throw new Error("Server error: " + response.status);
          }
        } catch (error) {
          alert("This email is already in use.");
          console.error("The error is: " + error);
        }
      });
    }
/* ------------- LOGIN ------------- */


const loginForm = document.getElementById("loginForm");
if(loginForm){
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const email = document.getElementById("inputEmail").value;
            const pswHash = document.getElementById("inputPassword").value;
            /* let formData = new FormData(loginForm);
            let email = formData.get("inputEmail");
            let pswHash = formData.get("inputPassword"); */
            console.log(email,pswHash)

            let url = "/user/login";


            try {
                let response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, pswHash }),
                });

                if (response.status != 200) {
                    throw new Error("Server error: " + response.status);
                }

                let data = await response.json();
                localStorage.setItem("token", data.token);



                try {
                    let avatarResponse = await fetch("/user/getAvatar", {
                        headers: {
                            Authorization: data.token,
                        },
                    });

                    if (avatarResponse.status == 200) {
                        let avatarData = await avatarResponse.json();
                        localStorage.setItem("avatarData", avatarData);
                    
                    }

                    alert("You are now logged in");
                    location.href = "index.html";
                } catch (error) {
                    if (error instanceof TypeError && error.message.includes('avatarData.avatarInfo is undefined')) {
            
                        location.href = "index.html";

                    } else {
                       // handleFetchError()
                    }

                }
            } catch (error) {
                //handleFetchError(error)
                alert("Wrong password or e-mail");
                console.error("The error is: " + error);
            }
        });


      }
/* ------------- SAVE AVATAR ------------- */
const checkBtn = document.getElementById("checkBtn")
if(checkBtn){
checkBtn.addEventListener("click", async function (event) {
    const avatarData = character.save();

    
    const formData = new FormData();
    formData.append("imageDataUrl", imageDataUrl);
    formData.append("avatarData", JSON.stringify(avatarData));
 
    
    try {
      let response = await fetch("/user/saveAvatar", {
        method: "PUT",
        headers: {
          Authorization: token,
        },
        body: formData,
      });
  
      if (response.status == 200) {
        let data = await response.json();
        console.log(data)
        alert("Saved your Avatar!");
      } else if (response.status === 401) {
        alert("Login expired, please log in again");
        location.href = "login.html";
      } else {
        throw new Error("Server error: " + response.status);
      }
    } catch (error) {
      console.error("The error is: " + error);
    }
  });
}