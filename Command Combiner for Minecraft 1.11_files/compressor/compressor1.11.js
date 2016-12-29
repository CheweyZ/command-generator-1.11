function compressor(check) {
    return check.map(function(current) {
        var stonetype
        //console.log(current);
        return current.replace(/stone *variant=([^\s]*)/gi, (function(a, b) {
            b = b.toLowerCase()
            //console.log(b);
            switch (b) {
                case 'stone':
                    stonetype = 'stone'
                    break;
                case 'granite':
                    stonetype = 'stone 1'
                    break;
                case 'smooth_granite':
                case 'smooth granite':
                case 'polished granite':
                case 'polished_granite':
                    stonetype = 'stone 2'
                    break;
                case 'diorite':
                    stonetype = 'stone 3'
                    break;
                case 'smooth_diorite':
                case 'smooth diorite':
                case 'polished diorite':
                case 'polished_diorite':
                    stonetype = 'stone 4'
                    break;
                case 'andesite':
                    stonetype = 'stone 5'
                    break;
                case 'smooth_andesite':
                case 'smooth andesite':
                case 'polished andesite':
                case 'polished_andesite':
                    stonetype = 'stone 6'
                    break;
                case 'cobblestone':
                    stonetype = 'cobblestone'
                    break;
                default:
                    stonetype = 'stone'
            }
            //console.log(stonetype);
            return stonetype
        }))
    })
}
