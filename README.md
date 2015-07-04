Decode 2048
===========

A clone of the game [2048](https://github.com/gabrielecirulli/2048) to make it as simple as possible for the purposes of learning how to code.

## Things to Fix

Of course this isn't perfect! Why not try and improve on some features we've purposefully left out?

- Currently you lose if the game board is full. You may still be able to make a move if this is the case. Make it so you only lose when it's impossible to move.
- This uses `position: absolute;` and `left` and `top` css properties for moving tiles. This isn't as performant as it could be, and should use the `transform: translate(x, y);` property.
- It requires a keyboard to function. How could you make it playable on mobile? Maybe check out the [original source code](https://github.com/gabrielecirulli/2048/blob/caef60a9a947ba107d83903d4f0dd72ba22f789f/js/keyboard_input_manager.js#L76-L127) to see how they do it.
