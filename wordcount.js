// https://stackoverflow.com/a/6969486
function escapeRegExp(string) {
    return string.replace(/[\-.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function WordCountModel() {
    var self = this;

    self.ignoreChars = ko.observable("‚’‘0123456789,;+.:_-!'#„“\"§$%&/\\()?\}][{@€<>|=*^");

    self.inputText = ko.observable("");

    var filterIgnoreChars = function(txt) {
        var iChars = self.ignoreChars();
        var r = '['+escapeRegExp(iChars)+']';
        return txt.replace(RegExp(r, 'g'), ' ');
    };

    self.charLength = ko.observable(0);
    self.wordLength = ko.observable(0);
    self.uniqueWords = ko.observable(0);

    self.toplist = ko.observable([]);

    self.process = function() {
        self.toplist([]);
        self.charLength(self.inputText().length);
        var filteredIgnoreChars = filterIgnoreChars(self.inputText());
        var rdyForProc = filteredIgnoreChars.toLowerCase();

        var words = rdyForProc.split(/\s+/);
        
        self.wordLength(words.length);

        var counts = Object.create(null);

        for (var i = 0; i < words.length; i++) {
            if (words[i].length == 0) continue;

            if (!counts[words[i]]) {
                counts[words[i]] = 1;
            } else {
                counts[words[i]]++;
            }
        }

        var result = [];

        for (w in counts) {
            result.push({'word': w, 'count': counts[w]});
        }

        result = _.sortBy(result, function(v) {
            return v.word;
        });

        result = _.sortBy(result, function(v){
            return -v.count;
        });

        self.uniqueWords(result.length);

        self.toplist(result);
    };

    var rightPad = function(txt, len) {
        var result = txt + "";
        while(result.length < len) {
            result = result + " ";
        }
        return result;
    }

    self.saveResult = function() {
        var newLine = "\r\n";
        var txt = "Zeichen verarbeitet: " + self.charLength() + newLine;
        txt += "Wörter verarbeitet: " + self.wordLength()+ newLine;
        txt += "Einzigartige Wörter: " + self.uniqueWords() + newLine;
        txt += newLine;

        var longestWord = 0;
        var longestNum = 0;

        for (var i = 0; i < self.toplist().length; i++) {
            var wl = self.toplist()[i].word.length;
            var nl = (self.toplist()[i].count + "").length;
            
            if (wl > longestWord) longestWord = wl;
            if (nl > longestNum) longestNum = nl;
        }

        for (var i = 0; i < self.toplist().length; i++) {
            txt += rightPad(self.toplist()[i].word, longestWord) + "   " + rightPad(self.toplist()[i].count, longestNum) + "   #" + (i+1) + newLine;
        }
        saveAs(new Blob([txt], {type: "application/text"}), "export.txt");
    };
}


document.addEventListener("DOMContentLoaded", function() {
    ko.options.deferUpdates = true;

    var model = new WordCountModel();
    ko.applyBindings(model);
});