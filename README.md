# AZCMap

A collaborative map to keep track of aedes aegypti threats.

## How to contribute from scratch

### Installing base applications 

Download and install git for windows: https://git-scm.com/download/win

Download and install nodejs: https://nodejs.org/

Download and install mongodb: https://www.mongodb.org/downloads#production

### Setting up your environment to start coding

Create a github account.

Open git bash (should be installed on your computer at this point).

Go to a folder of your choice to put the application repository. Example:

```
$ cd /e/Repos
```

run the following command:

```
$ git clone https://github.com/ArthurVilaca/AZCMap.git
```

Now you have the repository in your local machine. All you need to do is run the mongodb server and start your node server.

Choose a partition of your choice and add to its root directory a folder called 'data', then inside of data add a folder called 'db'.
This folder will be used to store your mongo database information.
Exemple: C:\data\db

Go to the partition you've chosen to run the mongo server, then run 'mongod'. Example:

```
$ cd /c/
$ mongod
```

Open another instance of git bash.

Go to the folder where the repository is cloned (/e/Repos/AZCMap in this example case).

Run the following command to start the node server:

```
$ node backend
```

Thats it, you can go to localhost:3000 in your browser and the application should be running.

### Creating a branch and pushing

open git bash.

Go to the folder where the repository is located (Ex: /c/Repos/AZCMap)

run: ```$ git checkout -b branch-name```

once you're done, run:

```
$ git add -A
$ git commit -m "commit message"
$ git push origin branch-name
```




