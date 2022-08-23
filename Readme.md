* npm install --global gulp-cli
* npm install

If you get error about permission : 

*Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

In the terminal run : ' gulp ' , this will initially clean generated folders/content and generate new files

All GovUK assets will be generated in the wwwroot/assets folder. All other will be in either css or js folder.

If you are running this via Visual Studio 2022, usr the Task Runner to activate the gulpfile.js