async function replaceEvents(html)
{
    if (!html) return "";

    let original = html;
    let result = "";

    while (original.length > 0)
    {
        let start = original.indexOf("<");
        let end = original.indexOf(">") + 1;

        if (start == -1 || end == 0)
        {
            result = result + original;
            break;
        }
        else
        {
            result = result + original.substring(0, start);
            let target = original.substring(start, end).trim();
            original = original.substring(end);

            target = target.replace(`@abort`, `onabort`);
            target = target.replace(`@afterprint`, `onafterprint`);
            target = target.replace(`@beforeprint`, `onbeforeprint`);
            target = target.replace(`@beforeinput`, `onbeforeinput`);
            target = target.replace(`@beforeunload`, `onbeforeunload`);
            target = target.replace(`@blur`, `onblur`);
            target = target.replace(`@canplay`, `oncanplay`);
            target = target.replace(`@canplaythrough`, `oncanplaythrough`);
            target = target.replace(`@change`, `onchange`);
            target = target.replace(`@click`, `onclick`);
            target = target.replace(`@copy`, `oncopy`);
            target = target.replace(`@cut`, `oncut`);
            target = target.replace(`@dblclick`, `ondblclick`);
            target = target.replace(`@drag`, `ondrag`);
            target = target.replace(`@dragend`, `ondragend`);
            target = target.replace(`@dragenter`, `ondragenter`);
            target = target.replace(`@dragleave`, `ondragleave`);
            target = target.replace(`@dragover`, `ondragover`);
            target = target.replace(`@dragstart`, `ondragstart`);
            target = target.replace(`@drop`, `ondrop`);
            target = target.replace(`@durationchange`, `ondurationchange`);
            target = target.replace(`@ended`, `onended`);
            target = target.replace(`@error`, `onerror`);
            target = target.replace(`@focus`, `onfocus`);
            target = target.replace(`@focusin`, `onfocusin`);
            target = target.replace(`@focusout`, `onfocusout`);
            target = target.replace(`@hashchange`, `onhashchange`);
            target = target.replace(`@input`, `oninput`);
            target = target.replace(`@invalid`, `oninvalid`);
            target = target.replace(`@keydown`, `onkeydown`);
            target = target.replace(`@keyup`, `onkeyup`);
            target = target.replace(`@load`, `onload`);
            target = target.replace(`@loadeddata`, `onloadeddata`);
            target = target.replace(`@loadedmetadata`, `onloadedmetadata`);
            target = target.replace(`@loadstart`, `onloadstart`);
            target = target.replace(`@mousedown`, `onmousedown`);
            target = target.replace(`@mouseenter`, `onmouseenter`);
            target = target.replace(`@mouseleave`, `onmouseleave`);
            target = target.replace(`@mousemove`, `onmousemove`);
            target = target.replace(`@mouseover`, `onmouseover`);
            target = target.replace(`@mouseout`, `onmouseout`);
            target = target.replace(`@mouseup`, `onmouseup`);
            target = target.replace(`@offline`, `onoffline`);
            target = target.replace(`@online`, `ononline`);
            target = target.replace(`@pagehide`, `onpagehide`);
            target = target.replace(`@pageshow`, `onpageshow`);
            target = target.replace(`@paste`, `onpaste`);
            target = target.replace(`@pause`, `onpause`);
            target = target.replace(`@play`, `onplay`);
            target = target.replace(`@playing`, `onplaying`);
            target = target.replace(`@progress`, `onprogress`);
            target = target.replace(`@ratechange`, `onratechange`);
            target = target.replace(`@resize`, `onresize`);
            target = target.replace(`@reset`, `onreset`);
            target = target.replace(`@scroll`, `onscroll`);
            target = target.replace(`@search`, `onsearch`);
            target = target.replace(`@seeked`, `onseeked`);
            target = target.replace(`@seeking`, `onseeking`);
            target = target.replace(`@select`, `onselect`);
            target = target.replace(`@show`, `onshow`);
            target = target.replace(`@stalled`, `onstalled`);
            target = target.replace(`@submit`, `onsubmit`);
            target = target.replace(`@suspend`, `onsuspend`);
            target = target.replace(`@timeupdate`, `ontimeupdate`);
            target = target.replace(`@toggle`, `ontoggle`);
            target = target.replace(`@touchcancel`, `ontouchcancel`);
            target = target.replace(`@touchend`, `ontouchend`);
            target = target.replace(`@touchmove`, `ontouchmove`);
            target = target.replace(`@touchstart`, `ontouchstart`);
            target = target.replace(`@unload`, `onunload`);
            target = target.replace(`@volumechange`, `onvolumechange`);
            target = target.replace(`@waiting`, `onwaiting`);

            result = result + target;
        }
    }

    return result;
}

module.exports = { replaceEvents }