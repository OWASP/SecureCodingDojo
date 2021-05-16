
#### Fork SCD 

Before you setup your environment, first create a fork of SCD to your personal GitHub.com account. Then, you can clone the repo and follow steps provided here: [Development Setup for Training Portal](https://github.com/OWASP/SecureCodingDojo/wiki/Development-Setup-for-Training-Portal)

If you don't do that you won't be able to push your branch to the remote repo since you aren't added as contributor to the main SCD project. When you are done with your changes then you can open a PR from your branch to the main project.

If you already had a forked version of SCD, first you will need to update that forked version with the main project before you can start working on it: 

Here are the main commands you need: 
https://gist.github.com/CristinaSolana/1885435

Then, update your fork with the latest changes as such: 

git push origin master

Happy Secure Coding!

#### Git Config 

If you use an enterprise or private GitHub account be careful with the global settings when pushing your code to GitHub.com as it might submit the username and email you had setup in organizatin when you commit your changes. Check your current settings via:

`git config --global user.email`

`git config --global user.name`

You can either update/remove those or use the --local to set that information only for the SecureCodingDojo repo. Inside the SCD repo do: 

`git config --local user.email "PERSONAL_EMAIL_HERE"`

`git config --local user.name "NICKNAME_HERE"`

There is also some settigs on your account that you can set. First go to https://github.com/settings/emails

Check `Keep my email addresses private` and `Block command line pushes that expose my email` options to increase the security and privacy of your account.

Keep in mind that by doing that you shouldn't set your git config --local, otherwise your pushes will fail.