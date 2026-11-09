import { readProfilePrefs, mutateProfilePrefs } from './profilePrefsService.js';

export const COLLECTION_COLORS=['#2563eb','#16a34a','#e11d48','#d97706','#0284c7','#64748b'];
export const BOARD_COLUMNS=['interesting','viewing','finalists','rejected'];
const timestamp=()=>new Date().toISOString();
const validName=value=>{
    const name=String(value||'').trim();
    if (!name || name.length>80) throw new Error('Ime mora vsebovati od 1 do 80 znakov.');
    return name;
};
function workspace(prefs) {
    const data=prefs.autohubCollections||{};
    return {version:1,folders:Array.isArray(data.folders)?data.folders:[],boards:Array.isArray(data.boards)?data.boards:[],notes:data.notes&&typeof data.notes==='object'?data.notes:{}};
}
function favourite(listing) {
    return {listingId:String(listing.id),title:listing.title||[listing.make,listing.model].filter(Boolean).join(' '),price:listing.price||'',priceEur:Number(listing.salePriceEur||listing.priceEur||listing.priceRaw)||null,image:listing.images?.exterior?.[0]||listing.image||'',savedAt:timestamp()};
}
function ensureSaved(prefs,listing) {
    const favourites=Array.isArray(prefs.favourites)?prefs.favourites:[];
    if (!favourites.some(item=>String(item.listingId)===String(listing.id))) favourites.unshift(favourite(listing));
    prefs.favourites=favourites;
}
export async function getCollections(uid) {
    const prefs=await readProfilePrefs(uid);
    return {...workspace(prefs),favourites:Array.isArray(prefs.favourites)?prefs.favourites:[]};
}
async function mutate(uid,change) {
    const prefs=await mutateProfilePrefs(uid,prefs=>{
        const data=workspace(prefs);change(data,prefs);
        return {...prefs,autohubCollections:data};
    });
    return {...workspace(prefs),favourites:Array.isArray(prefs.favourites)?prefs.favourites:[]};
}
function findFolder(data,id) {
    const folder=data.folders.find(item=>item.id===id);
    if(!folder)throw new Error('Mapa ne obstaja več.');return folder;
}
function findBoard(data,id) {
    const board=data.boards.find(item=>item.id===id);
    if(!board)throw new Error('Deska ne obstaja več.');return board;
}
export function createCollectionFolder(uid,{name,color}) {
    return mutate(uid,data=>data.folders.push({id:crypto.randomUUID(),name:validName(name),color:COLLECTION_COLORS.includes(color)?color:COLLECTION_COLORS[0],listingIds:[],createdAt:timestamp(),updatedAt:timestamp()}));
}
export function updateCollectionFolder(uid,id,{name,color}) {
    return mutate(uid,data=>Object.assign(findFolder(data,id),{name:validName(name),color:COLLECTION_COLORS.includes(color)?color:COLLECTION_COLORS[0],updatedAt:timestamp()}));
}
export function deleteCollectionFolder(uid,id) {
    return mutate(uid,data=>{data.folders=data.folders.filter(folder=>folder.id!==id);});
}
export function addListingToFolder(uid,folderId,listing) {
    return mutate(uid,(data,prefs)=>{
        const folder=findFolder(data,folderId);
        folder.listingIds=Array.from(new Set([...(folder.listingIds||[]),String(listing.id)]));folder.updatedAt=timestamp();ensureSaved(prefs,listing);
    });
}
export function removeListingFromFolder(uid,folderId,listingId) {
    return mutate(uid,data=>{const folder=findFolder(data,folderId);folder.listingIds=(folder.listingIds||[]).filter(id=>id!==String(listingId));folder.updatedAt=timestamp();});
}
export function saveCollectionNote(uid,listingId,note) {
    if(String(note).length>2000)throw new Error('Opomba je lahko dolga največ 2.000 znakov.');
    return mutate(uid,data=>{const key=String(listingId);if(String(note).trim())data.notes[key]=String(note).trim();else delete data.notes[key];});
}
export function createCollectionBoard(uid,{name,description='',maxPrice=null}) {
    return mutate(uid,data=>data.boards.push({id:crypto.randomUUID(),name:validName(name),description:String(description).slice(0,500),criteria:{maxPrice:Number(maxPrice)||null},cards:[],activity:[],createdAt:timestamp(),updatedAt:timestamp()}));
}
export function updateCollectionBoard(uid,id,{name,description,maxPrice}) {
    return mutate(uid,data=>Object.assign(findBoard(data,id),{name:validName(name),description:String(description||'').slice(0,500),criteria:{maxPrice:Number(maxPrice)||null},updatedAt:timestamp()}));
}
function activity(board,listingId,action) {
    board.updatedAt=timestamp();board.activity=[{id:crypto.randomUUID(),listingId:String(listingId),action,at:timestamp()},...(board.activity||[])].slice(0,30);
}
export function addListingToBoard(uid,boardId,listing,column='interesting') {
    return mutate(uid,(data,prefs)=>{
        const board=findBoard(data,boardId);
        if(!BOARD_COLUMNS.includes(column))throw new Error('Neveljaven stolpec.');
        if(!(board.cards||[]).some(card=>card.listingId===String(listing.id))){board.cards=[...(board.cards||[]),{listingId:String(listing.id),column,vote:null,note:'',addedAt:timestamp()}];activity(board,listing.id,'added');}
        ensureSaved(prefs,listing);
    });
}
export function updateBoardCard(uid,boardId,listingId,updates) {
    return mutate(uid,data=>{
        const board=findBoard(data,boardId);const card=(board.cards||[]).find(item=>item.listingId===String(listingId));
        if(!card)throw new Error('Oglasa ni več na deski.');
        if(updates.column){if(!BOARD_COLUMNS.includes(updates.column))throw new Error('Neveljaven stolpec.');card.column=updates.column;activity(board,listingId,'moved');}
        if(Object.hasOwn(updates,'vote')){if(![null,'yes','maybe','no'].includes(updates.vote))throw new Error('Neveljavna izbira.');card.vote=updates.vote;activity(board,listingId,'voted');}
        if(Object.hasOwn(updates,'note')){card.note=String(updates.note||'').slice(0,2000);activity(board,listingId,'noted');}
    });
}
export function removeBoardCard(uid,boardId,listingId) {
    return mutate(uid,data=>{const board=findBoard(data,boardId);board.cards=(board.cards||[]).filter(card=>card.listingId!==String(listingId));activity(board,listingId,'removed');});
}
