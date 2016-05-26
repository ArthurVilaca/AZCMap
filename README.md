# AZCMap

A collaborative map to keep track of aedes aegypti threats. [See the project running.](http://azcmap.bitnamiapp.com/)

## How to contribute from scratch

### Installing base applications 

Download and install git for windows: https://git-scm.com/download/win

Download and install nodejs: https://nodejs.org/

Download and install mongodb: https://www.mongodb.org/downloads#production

### Setting up your environment to start coding


**1)** Create a github account.


#### Clonning the project into your computer

**1)** Open Git Bash (should be installed on your computer at this point).

**2)** Go to a folder of your choice to put the application repository. Example:

```
$ cd /e/Repos
```

and run the following command:

```
$ git clone https://github.com/ArthurVilaca/AZCMap.git
```

Now you have the repository in your local machine. 

#### Starting MongoDB

**1)** Choose a partition of your choice and add to its root directory a folder called 'data', then inside of data add a folder called 'db'.
This folder will be used to store your mongo database information.
Example: *C:\data\db*

**2)** Go to the partition you've chosen to run the mongo server, then run `mongod`. Example:

```
$ cd /c/
$ mongod
```

#### Preparing development environment
For run node in the project, you first need to install all project's dependencies and tools. You have to open a new instance of Git Bash, since Mongo's one needs to keep running.

**1)** First, go to the project's root folder:
```
$ cd /e/Repos/AZCMap
```

**2)** Use `$ npm install` for install all dependencies.
**3)** Navigate to the backend folder:
```
$ cd backend
```
**4)** And again, run `$npm install` for install all backend dependencies.

#### Starting NodeJS
**1)** Go to the folder where the repository is cloned (/e/Repos/AZCMap in this example case).

Run the following command to start the node server:

```
$ node backend
```

Thats it, you can go to localhost:3000 in your browser and the application should be running.

### Creating a branch and pushing

Open Git Bash.

Go to the folder where the repository is located (e.g: /c/Repos/AZCMap)

run: ```$ git checkout -b branch-name```

once you're done, run:

```
$ git add -A
$ git commit -m "commit message"
$ git push origin branch-name
```