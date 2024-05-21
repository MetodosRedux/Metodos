export function printResponse(aMsg, aColor = null) {

    const messageDisplayContainerId = 'msgContainer'
    const messageDisplay = document.createElement("div");
    messageDisplay.id = messageDisplayContainerId;
    messageDisplay.textContent = aMsg;

    document.body.appendChild(messageDisplay);
  
    messageDisplay.style.color = aColor;
  
    setTimeout(() => {
      document.body.removeChild(messageDisplay);
    }, 5000);
  }
  
  export function displayErrorMsg(anError) {
    printResponse('An error ocurred, trying to reach the server. Resulted in error: ' + anError)
  }
  
  export async function fetchWrapper(aMethod, anUrl, aBodyElement) {

   const token =  localStorage.getItem("token")


    try {
      const response = await fetch(anUrl, {
        method: aMethod,
        headers: {
          Authorization: token,
         
        },
        body: aBodyElement,
      });
      return response;
    } catch (error) {
       console.error("An error during " + aMethod + " for url " + anUrl, error); 
      displayErrorMsg();
    }
  }