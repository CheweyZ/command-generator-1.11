function compressor(check) {
    return check.map(function(current) {
        var itemtype
        var reply
            //console.log(current);
            //
            //Multipleprams detection   
            // /stone ((?!\s{2}).)+
            //Onecondition 
            // /stone *variant=([^\s]*)/gi

        current = current.replace(/((?=minecraft:stone )((?!\s{2}).)+|(?=stone )((?!\s{2}).)+)/gi, (function(a, b) {
            b = b.toLowerCase()
            console.log(b);
            b.replace(/variant=([^\s]*)/gi, (function (c,d) {
                //console.log(b);
            switch (d) {
                case 'stone':
                    itemtype = 'stone'
                    break;
                case 'granite':
                    itemtype = 'stone 1'
                    break;
                case 'smooth_granite':
                case 'smooth granite':
                case 'polished granite':
                case 'polished_granite':
                    itemtype = 'stone 2'
                    break;
                case 'diorite':
                    itemtype = 'stone 3'
                    break;
                case 'smooth_diorite':
                case 'smooth diorite':
                case 'polished diorite':
                case 'polished_diorite':
                    itemtype = 'stone 4'
                    break;
                case 'andesite':
                    itemtype = 'stone 5'
                    break;
                case 'smooth_andesite':
                case 'smooth andesite':
                case 'polished andesite':
                case 'polished_andesite':
                    itemtype = 'stone 6'
                    break;
                case 'cobblestone':
                    itemtype = 'cobblestone'
                    break;
                default:
                    itemtype = 'stone'
            }
            //console.log(itemtype);
            return itemtype
          }))
          return itemtype
        }))
        current = current.replace(/((?=minecraft:stonebrick )((?!\s{2}).)+|(?=stonebrick )((?!\s{2}).)+)/gi, (function(a, b) {
            b = b.toLowerCase()
            //in event they ever update names
            currentblock='stonebrick'
            switch (b) {
                case 'stonebrick':
                    itemtype = currentblock
                    break;
                case 'mossy_stonebrick':
                    itemtype = currentblock+ ' 1'
                    break;
                case 'cracked_stonebrick':
                    itemtype = currentblock+' 2'
                    break;
                case 'chiseled_stonebrick':
                    itemtype = 'cracked_stonebrick'
                    break;
                default:
                    itemtype = 'stonebrick'
            }
            return itemtype
        }))
        return current
    })
}