# Train Diagram Module

## train-diagram.js


## train-diagram.class.js
This file contains the classes which constract the data structure that the train path diagram is needed. Each class indicates a specific entity on the train diagram.

### class Line

### class Station

### class Segment

### class Train


## train-diagram.view.js

### Display elements

- time value of time stamps
- overtaking curve





## train-diagram.command.js




### Basic function description

This program provide following basic actions. The usage guideline of each function is illustrated below.

#### Edit train paths

The users can use this function to edit the time stamps along the train path by move some sections of the train path. The train path must be selected unless this function will not take any effects.

The program provide 2 functions to move the train path:
- by dragging the time stamp anchor
- by move the path section directly

The first function is to maintain the orders and the relative time differences **AFTER** the editing anchor, while the second function only changes the corresponding time stamp (usually 1 departure time stamp and 1 arrival time stamp) and keeps other time stamps fixed.


#### Delete train paths

The users can use delete function to delete one or more train path, once they are selected before execute this function.

#### Add train paths



#### Copy train paths

This function allow users to copy an existing train path, and insert the ectypal train path into the diagram after setting an unique train ID.

#### Lengthen train paths



#### Shorten train paths



#### Cut off train paths



#### Merge train paths


### Implementation
