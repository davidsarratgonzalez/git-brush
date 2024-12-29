# git brush! 🎨

A tool to easily draw in your GitHub's profile contribution grid. It includes a feature-rich editor to design your custom pattern and a script to automate the process of creating the contribution grid once you provide it with your pattern.

# How does it work?

GitHub's contribution graph shows your activity through colored squares, where each square represents a day. The color intensity of each square is determined by the number of contributions made on that day. However, Git commits can have any date you specify when creating them, not just the current date. This means we can create commits with dates in the past to fill in the contribution graph however we want.

**git brush** takes advantage of this by creating commits with specific dates and quantities to draw patterns in your contribution graph. The **editor** lets you design your pattern by selecting different intensities, and the **script** automates creating the right number of commits on each date to achieve your desired design.

# How to use

1. Go to the [git brush editor page](https://davidsarratgonzalez.github.io/git-brush)
2. Create your desired pattern
3. **Export** your pattern (it will be downloaded as a JSON file)
4. Download the [git brush script](https://davidsarratgonzalez.github.io/git-brush/downloads/gitbrush.sh)
5. Create a [new GitHub repository](https://github.com/new)
6. Clone the repository to your local machine
7. Place **both** the **JSON file** and the **script** you downloaded in your repository
8. Run the script
9. Wait for the script to finish
10. Push your changes to the GitHub repository
11. Enjoy your fancy contribution grid! 🎉

---

**Note:** Please keep in mind that your contribution graph may take a few minutes to update.
