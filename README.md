catreact-examples
=================

These examples use the Catavolt React Libraries (Core + Extended)



## Example Apps

**Catavolt Default Client**
The canonical implementation of a Catavolot Client Application.   Good example of how to use Catavolt Extended Components.  It also uses the React Router for history and navigation.

**Buzz Feed**
Use React Router and the ‘Core’ Catavolt React Components.  A good example of a completely custom application.
                                                

# Project Setup

* If using Typescript (recommended), [WebStorm](https://www.jetbrains.com/webstorm/) is recommended as an ide, as it has very good Typescript support

* Install [Node.js](https://nodejs.org/en/) (5+ recommended) directly or use [nvm](https://github.com/creationix/nvm#installation) to easily manage installations
  
* From this project's root directory (catreact-examples), run 'npm install'  

# To run the example

* Open the index.html in one of the examples (catavolt-client, demo-buzz-feed, etc.) (or 'launch' it from your ide)


# To build the web bundle in catavolt-client

* From the root directory run 'npm start'

* This will run babel (ES6 transpiler) and a 'web formatter' on the javascript generated by your typescript files. This will generate a single 'bundle' file that can be included on webpages.  To see an example of this check the 'npm start' script in the package.json file.  This script uses 'watchify' with a babel plugin to acheive both transformations.

* Open the index.html in 'catavolt-client' (or 'launch' it from your ide)

# React Component docs can be found [here](https://rawgit.com/catavolt-oss/catreact-examples/master/docs/catreact/index.html)
# SDK API docs can be found [here](https://rawgit.com/catavolt-oss/catreact-examples/master/docs/catavolt-sdk/index.html)

# Configuring WebStorm for Typescript:

* Open the catreact project root folder in WebStorm
* Go to WebStorm -> Preferences -> Languages and Frameworks -> Javascript
* Set the Language Level to JSX Harmony
* Go to WebStorm -> Preferences -> Languages and Frameworks -> TypeScript panel
* Choose 'Enable TypeScript Compiler'
* Make sure the path to the Node interpreter is correct
* Optionally choose to use a custom version of the Typescript Compiler (1.8+ is required)
* Choose 'Use tsconfig.json' radio option
* Click 'Apply' and 'Ok'
* Open the TypeScript Compiler panel at the bottom of WebStorm and Choose 'Compile All' from the buttons on the left

