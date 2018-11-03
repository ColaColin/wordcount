// https://stackoverflow.com/a/6969486
function escapeRegExp(string) {
    return string.replace(/[\-.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function WordCountModel() {
    var self = this;

    self.ignoreChars = ko.observable("”‚’‘0123456789,;+.:_-!'#„“\"§$%&/\\()?\}][{@€<>|=*^©–");

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

    self.countHistogramData = ko.observable([]);

    self.sortByAlpha = function() {
        var result = self.toplist();

        result = _.sortBy(result, function(v) {
            return v.word;
        });

        self.toplist(result);
    };

    var sortListByCount = function(result) {
        result = _.sortBy(result, function(v) {
            return v.word;
        });

        result = _.sortBy(result, function(v){
            return -v.count;
        });
        return result;
    };

    self.sortByCount = function() {
        var result = self.toplist();

        result = sortListByCount(result);

        self.toplist(result);
    };

    var countSet = function(words) {
        var counts = Object.create(null);

        for (var i = 0; i < words.length; i++) {
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

        return result;
    };

    self.process = function() {
        self.toplist([]);
        self.charLength(self.inputText().length);
        var filteredIgnoreChars = filterIgnoreChars(self.inputText());
        var rdyForProc = filteredIgnoreChars.toLowerCase();

        var wordSplit = rdyForProc.split(/\s+/);
        
        var words = [];

        for (var i = 0; i < wordSplit.length; i++) {
            if (wordSplit[i].length > 0) words.push(wordSplit[i]);
        }

        self.wordLength(words.length);

        var result = countSet(words);

        self.uniqueWords(result.length);

        var countHisto = countSet(_.map(result, function(e) {return e.count}));

        countHisto = _.map(countHisto, function(e) {
            return {'word': Number(e.word), 'count': e.count};
        });

        countHisto = sortListByCount(countHisto);

        self.countHistogramData(countHisto);

        self.toplist(result);

        self.sortByCount();
    };

    var rightPad = function(txt, len) {
        var result = txt + "";
        while(result.length < len) {
            result = result + " ";
        }
        return result;
    }

    var newLine = "\r\n";

    var mkTxt = function(lst) {
        var txt = "";
        var longestWord = 0;
        var longestNum = 0;

        for (var i = 0; i < lst.length; i++) {
            var wl = lst[i].word.length;
            var nl = (lst[i].count + "").length;
            
            if (wl > longestWord) longestWord = wl;
            if (nl > longestNum) longestNum = nl;
        }

        for (var i = 0; i < lst.length; i++) {
            txt += rightPad(lst[i].word, longestWord) + "   " + rightPad(lst[i].count, longestNum) + "   #" + (i+1) + newLine;
        }

        return txt;
    };

    self.saveResult = function() {
        var txt = "Zeichen verarbeitet: " + self.charLength() + newLine;
        txt += "Wörter verarbeitet: " + self.wordLength()+ newLine;
        txt += "Einzelne Wörter: " + self.uniqueWords() + newLine;
        txt += newLine;
        txt += "Verteilung der Anzahlen" + newLine;

        txt += mkTxt(self.countHistogramData());

        txt += newLine;
        txt += "Topliste der Wörter" + newLine;

        txt += mkTxt(self.toplist());

        saveAs(new Blob([txt], {type: "application/text"}), "export.txt");
    };
}


document.addEventListener("DOMContentLoaded", function() {
    ko.options.deferUpdates = true;

    var model = new WordCountModel();
    ko.applyBindings(model);
});