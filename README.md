# **Code for the Avatar studio**

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

> [!IMPORTANT]
> in the code here Bootstrap and three is imported using node and Gulp

# In case you need to update three.js:

1. Run `gulp` in the terminal.

2. Change the following files in the `dist/mjs/` directory:
    - `BufferGeometryUtils`
    - `GLTFLoader`
    - `OrbitControls`  
      
    Change the `'three'` imports to `'./three.module.js'`.
3. Update the import statements:
    - In `GLTFLoader`, change the second import to:

        `import { toTrianglesDrawMode } from './BufferGeometryUtils.js';`


# Saving and loading files as GLTF: 

You have to use the DRACO-compression to save the files from your 3D software (from may.07.2024).  
This is du to the fact that the files tend to get large when working with many 3D objects.  

When loading a new file you only have to give the loader the new relative path to your assets inside the **TCharacterClass**.  
it will look something like this:  

` loader.load("./mediaAvatar/folder/yourFile.gltf", ()=> .....) `




    
