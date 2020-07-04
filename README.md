Bani Reader provides a clean view of bani intended for reading on a computer screen. Currently only Google Chromium
based browsers are known to have a text layout engine that works well.

<details>
	<summary>Why only Chrome?</summary>
Bani Reader attempts to create an automated layout that is aesthetically pleasing. There is no layout information in
the source data, and being an automated effort it does not work optimally in all cases, but overall it works
reasonably well. It relies on a combination of the CSS property <code>whitespace: nowrap</code> and the
<code>&lt;wbr></code> HTML element. Browsers are not consistent in the way they lay out text with this combination but
Chrome does what I hoped it would when I imagined the approach while other browsers do not.
</details>

## Using Bani Reader

The initial screen allows you to select which source you would like to read from. At this point it is recommended to
either enable fullscreen or at least size and position your browser the way you want to keep it while reading. The
text layout is only somewhat responsive to changes in window or font size, so it may take a few pages of navigating to
catch up to any changes.
After selecting a source you will see the first page of bani displayed. While reading bani you can press "H" at any
time to bring up help and options.

* Display of visraam (pauses) can be enabled or disabled
* Colors can be customized

action | hot keys
-------|---------
Next page | <kbd>Space</kbd>, <kbd>►</kbd>, <kbd>▼</kbd>, <kbd>Page Down</kbd>
Previous page | <kbd>◄</kbd>, <kbd>▲</kbd>, <kbd>Page Up</kbd>
Increase font size | <kbd>+</kbd>, <kbd>=</kbd>
Decrease font size | <kbd>-</kbd>

> TIP: If the bani is rendered outside the visible area you can press the minus key ( <kbd>-</kbd> ) a few times to
decrease the font size until everything can be read. Be sure to increase the font size before navigating to the next
page.
