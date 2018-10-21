/**
 * Fuse - Lightweight fuzzy-search
 *
 * Copyright (c) 2012 Kirollos Risk <kirollos@gmail.com>.
 * All Rights Reserved. Apache Software License 2.0
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
!function(){function Searcher(pattern,options){options=options||{};var MATCH_LOCATION=options.location||0,MATCH_DISTANCE=options.distance||100,MATCH_THRESHOLD=options.threshold||.6,pattern=options.caseSensitive?pattern:pattern.toLowerCase(),patternLen=pattern.length;if(patternLen>32){throw new Error("Pattern length is too long")}var matchmask=1<<patternLen-1;var pattern_alphabet=function(){var mask={},i=0;for(i=0;i<patternLen;i++){mask[pattern.charAt(i)]=0}for(i=0;i<patternLen;i++){mask[pattern.charAt(i)]|=1<<pattern.length-i-1}return mask}();function match_bitapScore(e,x){var accuracy=e/patternLen,proximity=Math.abs(MATCH_LOCATION-x);if(!MATCH_DISTANCE){return proximity?1:accuracy}return accuracy+proximity/MATCH_DISTANCE}this.search=function(text){text=options.caseSensitive?text:text.toLowerCase();if(pattern===text){return{isMatch:true,score:0}}var i,j,textLen=text.length,scoreThreshold=MATCH_THRESHOLD,bestLoc=text.indexOf(pattern,MATCH_LOCATION),binMin,binMid,binMax=patternLen+textLen,lastRd,start,finish,rd,charMatch,score=1,locations=[];if(bestLoc!=-1){scoreThreshold=Math.min(match_bitapScore(0,bestLoc),scoreThreshold);bestLoc=text.lastIndexOf(pattern,MATCH_LOCATION+patternLen);if(bestLoc!=-1){scoreThreshold=Math.min(match_bitapScore(0,bestLoc),scoreThreshold)}}bestLoc=-1;for(i=0;i<patternLen;i++){binMin=0;binMid=binMax;while(binMin<binMid){if(match_bitapScore(i,MATCH_LOCATION+binMid)<=scoreThreshold){binMin=binMid}else{binMax=binMid}binMid=Math.floor((binMax-binMin)/2+binMin)}binMax=binMid;start=Math.max(1,MATCH_LOCATION-binMid+1);finish=Math.min(MATCH_LOCATION+binMid,textLen)+patternLen;rd=Array(finish+2);rd[finish+1]=(1<<i)-1;for(j=finish;j>=start;j--){charMatch=pattern_alphabet[text.charAt(j-1)];if(i===0){rd[j]=(rd[j+1]<<1|1)&charMatch}else{rd[j]=(rd[j+1]<<1|1)&charMatch|((lastRd[j+1]|lastRd[j])<<1|1)|lastRd[j+1]}if(rd[j]&matchmask){score=match_bitapScore(i,j-1);if(score<=scoreThreshold){scoreThreshold=score;bestLoc=j-1;locations.push(bestLoc);if(bestLoc>MATCH_LOCATION){start=Math.max(1,2*MATCH_LOCATION-bestLoc)}else{break}}}}if(match_bitapScore(i+1,MATCH_LOCATION)>scoreThreshold){break}lastRd=rd}return{isMatch:bestLoc>=0,score:score}}}function Fuse(list,options){options=options||{};var keys=options.keys;this.search=function(pattern){var searcher=new Searcher(pattern,options),i,j,item,text,dataLen=list.length,bitapResult,rawResults=[],resultMap={},rawResultsLen,existingResult,results=[],compute=null;function analyzeText(text,entity,index){if(text!==undefined&&text!==null&&typeof text==="string"){bitapResult=searcher.search(text);if(bitapResult.isMatch){existingResult=resultMap[index];if(existingResult){existingResult.score=Math.min(existingResult.score,bitapResult.score)}else{resultMap[index]={item:entity,score:bitapResult.score};rawResults.push(resultMap[index])}}}}if(typeof list[0]==="string"){for(i=0;i<dataLen;i++){analyzeText(list[i],i,i)}}else{for(i=0;i<dataLen;i++){item=list[i];for(j=0;j<keys.length;j++){analyzeText(item[keys[j]],item,i)}}}rawResults.sort(function(a,b){return a.score-b.score});rawResultsLen=rawResults.length;for(i=0;i<rawResultsLen;i++){results.push(options.id?rawResults[i].item[options.id]:rawResults[i].item)}return results}}if(typeof module!=="undefined"&&typeof module.exports!=="undefined"){if(typeof module.setExports==="function"){module.setExports(Fuse)}else{module.exports=Fuse}}else{window.Fuse=Fuse}}();