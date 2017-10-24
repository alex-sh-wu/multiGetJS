# multiGetJS

This is an application that downloads part of a file from a web server, in chunks.

This code was coded with Node.js v6.11.4. It is guaranteed to run on a Windows machine after installing the proper npm packages.

To install npm packages, run `npm install` on the root directory.
	
To run the project:

```
node main.js [OPTIONS] url
```

The options are:

__-o *string*__
- Write output to \<file\> instead of default

__-parallel__
- Download chunks in parallel instead of sequentally

__-chunkNumber *int*__
- Specify the number of chunks to use. The default number is 4. Must also pass in the '-parallel' flag

__-downloadSize *int*__
- Specify the total size of the file to be downloaded

## Bonus Features Implemented:
- if a file specified to be downloaded was smaller than 4 MiB, multiGet will readjust the size
- You can adjust the size file to be downloaded with the '-downloadSize' flag
- When downloading the file with using the '-parallel' flag, you can adjust the size of the chunks using '-chunkNumer'


## A few remarks:
- For this project, I spent a good portion of my time debugging one particular problem. When I was writing the code to write to file, the charset used by the http response and the charset used by Node.js to write to file were different, leading to a difference in the file size downloaded (e.g. I was requesting 4 MiB of data, but the file I downloaded ended up being 7-8 MiB). I did not know this was a problem until I researched.
