# API

## POST /user
> Creates a user in the database.
   
Expects: JSON {username, email, password} <br>
Returns: JSON  {msg} <br>
Requires: none <br>

## POST /user/login 
> Verifies user and logs in.
   
Expects: JSON {email, password} <br>
Returns: JSON  {msg, token, avatar} <br>
Requires: none <br>

## POST /user/avatar
> Saves the avatar to database and a picture to disc.

Expects: Formdata {avatarData, imgDataUrl} <br>
Returns: JSON  {msg} <br>
Requires: token <br>

## GET /user/game/id
> retrieved the users Id.
   
Returns: JSON  {userId} <br>
Requires: token <br>
