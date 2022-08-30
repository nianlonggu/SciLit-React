import {useState, useEffect, useRef} from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import FormatQuote from '@mui/icons-material/FormatQuote';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import logo from './app-logo-white.png';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import SearchIcon from '@mui/icons-material/Search';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import red from '@mui/material/colors/red';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import createTheme from '@mui/material/styles/createTheme';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import UnfoldLessDoubleIcon from '@mui/icons-material/UnfoldLessDouble';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Pagination from '@mui/material/Pagination';

const theme = createTheme({
  palette: {
    primary: {
      main: red["A200"],
    },
  },
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}




// window.HTMLElement.prototype.scrollIntoView = function() {};

export default function App() {
  
  const [windowSize, setWindowSize] = useState( getWindowSize());
  const [sidebarStatus, setSidebarStatus] = useState(1);
  const [sidebarDisplay, setSidebarDisplay] = useState(null);
  const maxDrawerWidth = 435;
  const [drawerWidth, setDrawerWidth] = useState(maxDrawerWidth);
  // const [context, setContext] = useState("");
  // const [keywords, setKeywords] = useState("");
  // const [citationText, setCitationText] = useState("");
  const [paperInfoList, setPaperInfoList] = useState([]);
  const nlp_server_address = process.env.REACT_APP_NLP_SERVER_ADDRESS;
  const [paper_offset, set_paper_offset] = useState(0);
  const num_papers_per_page  = 2;
  const nResults = 100;
  const [log_search_progress, set_log_search_progress] = useState("");
  const [export_citation_progress, set_export_citation_progress] = useState("");
  // const [all_element_keys, set_all_element_keys] = useState([]);

  const [selected_cited_paper_info, set_selected_cited_paper_info] = useState(null);
  const [open_export_citation, set_open_export_citation] = useState(false);
  const [export_citation_tab_value, set_export_citation_tab_value] = useState(0);
  const [export_citation_bibtex, set_export_citation_bibtex] = useState("");
  const [export_citation_mla, set_export_citation_mla] = useState("");

  const [toast_copied_open, set_toast_copied_open] = useState(false);


  // const [debug_info, set_debug_info] = useState("");

  const itemsRef = useRef({});

  const input_context_ref = useRef("");
  const input_keywords_ref = useRef("");
  const input_gen_cit_ref = useRef("");



  async function text_processing(data){
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
    const response = await fetch( nlp_server_address + "/ml-api/process/v1.0", requestOptions);
    const response_data = await response.json();
    const response_data_response = await response_data["response"];

    return response_data_response;
  }


  async function export_citation(paper_id_info){
    const data={
        "paper_list":[ paper_id_info ]
    };

    

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };

    const response = await fetch( nlp_server_address + "/ml-api/citation-formatting-service/v1.0", requestOptions);
    const response_data = await response.json();
    const response_data_response = await response_data["response"];
    return response_data_response;
  }

  async function get_papers_content(paper_list){
    const data = {
      paper_list:paper_list,
      projection:null
    };
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
    const response = await fetch( nlp_server_address + "/ml-api/get-papers/v1.0", requestOptions);
    const response_data = await response.json();
    const response_data_response = await response_data["response"];

    return response_data_response;
  }


  async function searchDocumentsRequest( context, keywords, nResults){

    const data = {
      ranking_variable:context,
      keywords:keywords.replaceAll(';', '\\t'),
      paper_list:"",
      prefetch_nResults_per_collection:100,
      nResults:nResults,
      requires_removing_duplicates:true,
      requires_additional_prefetching:false,
      requires_reranking:true,
      reranking_method:"scibert"
    };

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
    const response = await fetch( nlp_server_address + "/ml-api/doc-search/v1.0", 
          requestOptions);
    const response_data = await response.json();

    return response_data;
  }


  function get_sentence_list_from_section( section ){
      const para_sentence_list = section["section_text"].map( (para_item, para_idx)=>{
          return para_item["paragraph_text"].map( (sen_item, sen_idx)=>{
              return sen_item["sentence_text"];
          });
      });

      let sen_list = []
      for (let i = 0; i<para_sentence_list.length; i++){
          sen_list = sen_list.concat( para_sentence_list[i] );
      }
      return sen_list
  }


  function get_sentence_list_from_paper_content( paper_content ){
    const Abstract_Parsed = (paper_content.Content ?? {}).Abstract_Parsed ?? [];
    const Fullbody_Parsed = (paper_content.Content ?? {}).Fullbody_Parsed ?? [];
    const section_list =  (Fullbody_Parsed.length>0)?Fullbody_Parsed: Abstract_Parsed; 
    let sentence_list = [];
    for (let sec_i = 0; sec_i<section_list.length; sec_i ++){
        sentence_list = sentence_list.concat( get_sentence_list_from_section( section_list[sec_i] ) );
    }

    return sentence_list;
  }


  async function extract_highlights_from_papers( paper_content_list ){

    const batch_sentence_list = paper_content_list.map( ( item, idx ) =>{
        return get_sentence_list_from_paper_content( item );
    } );



    const batch_output = await Promise.all(batch_sentence_list.map( async (item, idx)=> {
        const data = { sentence_list: item };
        const requestOptions = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data)};
        const response = await fetch( nlp_server_address + "/ml-api/extractive-summarize/v1.0", 
                                      requestOptions);
        const response_data = await response.json();
        const response_data_response = await response_data["response"];
        const response_data_summary = await response_data_response["summary"];

        return response_data_summary;
    }));

    return batch_output;
  }


  //replaceAll(';', '\\t'),

  async function generate_citations_for_papers( paper_content_list, ranking_variable, keywords ){


    const context_list = paper_content_list.map( (item, idx)=>{ return ranking_variable; } );
    const keywords_list = paper_content_list.map( (item, idx)=>{ return keywords.replaceAll(';', '\\t') } );
    const papers = paper_content_list.map( (item, idx)=>{ return {
                                                      Title:item.Title ?? "",
                                                      Abstract:item.Abstract ?? ""
                                                                  }; 
                                          } );
    const data = {
        context_list:context_list,
        keywords_list:keywords_list,
        papers:papers
    };
    const requestOptions = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data)};
    const response = await fetch( nlp_server_address + "/ml-api/generate-citation/v1.0", 
                                      requestOptions);
    const response_data = await response.json();
    const response_data_response = await response_data["response"];

    const gen_text_list = response_data_response.map( (item, idx)=>{

        return item.trim();
    } );

    return gen_text_list;

  }


  // function get_all_element_keys(paperInfoList,paper_offset,num_papers_per_page){
  //    const filtered_paper_info_list =  paperInfoList.map( (item, idx)=>{ return {item:item, idx:idx} } ).filter( 
  //         (item, idx)=>{
  //             return (idx >=paper_offset && idx< paper_offset+num_papers_per_page && idx < paperInfoList.length);
  //         });
  //    let key_list = [];

  //    for (let paper_i=0; paper_i<filtered_paper_info_list.length; paper_i++){
  //       const paper_idx = filtered_paper_info_list[paper_i].idx;
  //       const paper_info = filtered_paper_info_list[paper_i].item;
  //       // extracted sentences
  //       const highlights_info = paper_info.highlights_info;
  //       for (let highlight_i = 0; highlight_i<highlights_info.length; highlight_i ++){
  //           key_list.push( 
  //               JSON.stringify( { "paper_idx":paper_idx.toString(),  
  //                                 "field_name":"highlights",
  //                                 "sentence_id":highlight_i.toString(),
  //                               } )
  //            );
  //       } 

  //       // abstract and fullbody
  //       const field_names = [ "abstract", "fullbody" ];
  //       for ( let field_i = 0; field_i< field_names.length;field_i++ ){
  //         const field_name = field_names[field_i];
  //         const sections = (field_name==="abstract")?(paper_info.content_info.Content??{}).Abstract_Parsed??[] :
  //                                                   (paper_info.content_info.Content??{}).Fullbody_Parsed??[] ;

  //         for (let sec_i = 0; sec_i<sections.length; sec_i ++){
  //           const section = sections[sec_i];
  //           const section_id = section.section_id;
  //           const section_text = section.section_text;
  //           for ( let para_i = 0; para_i<section_text.length; para_i++){
  //               const paragraph = section_text[para_i];
  //               const paragraph_id = paragraph.paragraph_id;
  //               const paragraph_text = paragraph.paragraph_text;
  //               for ( let sen_i = 0; sen_i<paragraph_text.length; sen_i ++){
  //                   const sentence = paragraph_text[sen_i];
  //                   const sentence_id = sentence.sentence_id;
  //                   key_list.push( 
  //                         JSON.stringify(
  //                             {
  //                                 "paper_idx":paper_idx.toString(), 
  //                                 "field_name":field_name.toString(),
  //                                 "section_id":section_id.toString(),
  //                                 "paragraph_id":paragraph_id.toString(),
  //                                 "sentence_id":sentence_id.toString()
  //                             })
  //                         );
  //               }

  //           }
  //         } 

  //       }

  //       //Reference
  //       const references = paper_info.content_info.Reference??[];
  //       for (let ref_i = 0; ref_i < references.length; ref_i++ ){
  //           key_list.push( 
  //                         JSON.stringify(
  //                             {
  //                                 "paper_idx":paper_idx.toString(), 
  //                                 "field_name":"references",
  //                                 "reference_id":ref_i.toString()
  //                             })
  //                         );
  //       }

  //    }

  //    return key_list;
  // }




  async function highlight_paper(paper_to_highlight){ 

    let paper_info = JSON.parse(JSON.stringify(paper_to_highlight));
                   
    const highlighted_paper_and_ref_sen_info = await text_processing( 
             {
                   data:{ 
                           paper:paper_info.content_info,
                           ref_sentences:paper_info.highlights_info.map( (item, idx)=>{ return item.text; })
                         },
                   mode:"highlight_paper_given_ref_sentences"
             } );


   const highlighted_paper = highlighted_paper_and_ref_sen_info.highlighted_paper;
   const ref_sentences_with_matched_sen_ids = highlighted_paper_and_ref_sen_info.ref_sentences_with_matched_sen_ids;

   for ( let i = 0; i<ref_sentences_with_matched_sen_ids.length; i++ ){
         paper_info.highlights_info[i]["matched_sen_id_info"] = ref_sentences_with_matched_sen_ids[i]["matched_sen_id_info"];
   }

   paper_info.content_info = highlighted_paper;

   return paper_info;

 }


  async function callback_paginating_papers( paper_id_list, context, keywords ){

    const paper_content_list = await get_papers_content( paper_id_list );

    set_log_search_progress("extracting highlights ...");
    const extracted_highlights_list = await extract_highlights_from_papers(paper_content_list);
    const spans_for_extracted_highlights_list = await Promise.all( 
          extracted_highlights_list.map( async (extracted_sens, _)=>{
              const spans_per_paper = await Promise.all( extracted_sens.map( async (sen, _)=>{
                    const spans_per_sen = await text_processing(
                    {
                        data:{
                            text:"• "+sen, 
                            // text:sen,
                            keywords:keywords
                        },
                        mode:"highlight_text_given_keywords"
                    } 
                    );
                    
                    return spans_per_sen;
                  } ));
              return spans_per_paper;

        } ));
    const extracted_highlights_info_list = []
    for (let paper_idx=0; paper_idx<extracted_highlights_list.length; paper_idx++){
        const extracted_highlights_info_per_paper  = [];
        for (let sen_idx = 0;  sen_idx< extracted_highlights_list[paper_idx].length; sen_idx++ ){
            extracted_highlights_info_per_paper.push( {
                                    text:"• "+extracted_highlights_list[paper_idx][sen_idx],
                                    // text: extracted_highlights_list[paper_idx][sen_idx],
                         highlight_spans:spans_for_extracted_highlights_list[paper_idx][sen_idx]
                                                      } );
        }
        extracted_highlights_info_list.push(extracted_highlights_info_per_paper);
    }

    set_log_search_progress("generating citations ...");
    const gen_text_list = await generate_citations_for_papers( paper_content_list, context, keywords );
    const gen_text_info_list = await Promise.all( 
          gen_text_list.map( async (gen_sen, _) =>{
              const spans_gen_sen = await text_processing( 
                    {
                        data:{ 
                            text:gen_sen,
                            keywords:keywords
                        },
                        mode:"highlight_text_given_keywords"
                    } 

                );  
              return {
                  text:gen_sen,
                  highlight_spans:spans_gen_sen
              }
          } )
     );


    let unhighlighted_paper_info_list = [];
    for (let i = 0; i<paper_id_list.length; i++ ){
        unhighlighted_paper_info_list.push(
            {
                "id_info":paper_id_list[i],
                "is_showing_fulltext":false,
                "content_info":paper_content_list[i],
                "highlights_info":extracted_highlights_info_list[i],
                "generated_citation_info":gen_text_info_list[i]
            }
        );
    }


    set_log_search_progress("rendering ...");

    const paper_info_list = await Promise.all( 
          unhighlighted_paper_info_list.map( async (item, idx)=>{
            return await highlight_paper(item);
          } )
      );

    set_log_search_progress("");

    return paper_info_list;
  }

  async function callback_search_pipeline(){

    input_gen_cit_ref.current.value = "";
    set_selected_cited_paper_info(null);
    const context = input_context_ref.current.value;
    const keywords = input_keywords_ref.current.value;
    const new_paper_offset = 0;


    if ( context==="" && keywords ==="" ){
        set_paper_offset( new_paper_offset );
        setPaperInfoList( [] );


    }else{
        set_log_search_progress("searching for documents ...")
        const paper_id_premise = await searchDocumentsRequest(context, keywords, nResults);
        const paper_id_list = await paper_id_premise["response"];
        
        const paper_info_list_slice = await callback_paginating_papers( 
                    paper_id_list.slice( new_paper_offset, new_paper_offset + num_papers_per_page ), context, keywords );

        const paper_info_list = paper_id_list.map( (item, idx) =>{
              if ( idx >= new_paper_offset &&
                   idx < new_paper_offset + num_papers_per_page &&
                   idx - new_paper_offset < paper_info_list_slice.length
                 ){
                  return paper_info_list_slice[ idx - new_paper_offset ];
              }else{
                  return {
                      id_info:item,
                      is_showing_fulltext:false
                  }

              }
        } );
        set_paper_offset( new_paper_offset );
        setPaperInfoList( paper_info_list );

    }


  }

  function getWindowSize() {
    const {innerWidth, innerHeight} = window;
    return {innerWidth, innerHeight};
  }

  function updateSidebarStatus() {
    const oldSidebarStatus = sidebarStatus
    setSidebarStatus( 1 - oldSidebarStatus);
    setSidebarDisplay( oldSidebarStatus === 1 ? "none" : null  )
    setDrawerWidth(  oldSidebarStatus === 1 ? 55 : maxDrawerWidth  )
  }

  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);




  function write_highlighted_text( text, highlight_spans, variant, display, text_color, highlight_color ){
      const text_spans = [];
      let current_pos = 0;
      for ( let i = 0; i<highlight_spans.length; i ++ ){
          const span = highlight_spans[i];
          text_spans.push( (<Typography 
                                variant = {variant}
                                color = {text_color}
                                display = "inline"
                                key = { i.toString() +"non-highlight" }
                                 > 
                                
                                {text.slice( current_pos, span.start )}
                            </Typography>
            ) );
          text_spans.push( (<Typography 
                                variant = {variant}
                                color = {highlight_color}
                                display = "inline" 
                                key = { i.toString() +"highlight" }
                                > 
                                {text.slice( span.start, span.end )}
                            </Typography>
            ) );
          current_pos = span.end
      }
      text_spans.push(  (<Typography 
                                variant = {variant}
                                color = {text_color}
                                display = "inline" 
                                key = { highlight_spans.length.toString() +"non-highlight" }
                                > 
                                {text.slice( current_pos )+" "}
                            </Typography>
            )  );

      return (
          <Box sx={{width:"100%", 
                    display: {display},
                    lineHeight:"normal",
                    mb:1
          }} >
              {
                text_spans.map( (item, idx) =>{
                    return item;
                } )
              }
          </Box>
      )
  }



  function render_sentence( paper_idx, text, spans, variant, display, text_color, highlight_color ){
      const text_spans = [];
      for ( let i = 0; i<spans.length; i ++ ){
          const span = spans[i];

          if ( span.action === "none"){
              text_spans.push( (<Typography 
                                variant = {variant}
                                color = {text_color}
                                display = "inline"
                                key = { i.toString()}
                                 > 
                                {text.slice( span.start, span.end )}
                            </Typography>
              ) );
          } else if (span.action === "highlight"){
                text_spans.push( (<Typography 
                                variant = {variant}
                                color = {highlight_color}
                                display = "inline"
                                key = { i.toString()}
                                 > 
                                {text.slice( span.start, span.end )}
                            </Typography>
               ) );
          } else if (span.action === "citation_marker"){
                const ref_id = span.param.ref_id

                text_spans.push(
                        ( <Link 
                                href="#" 
                                underline="none"
                                variant = {variant}
                                color = "#2974dd"
                                display = "inline"
                                key = { i.toString()}
                                onClick = { ()=> setTimeout( ()=>{  
                                  itemsRef.current[  
                                    JSON.stringify({ "paper_idx":paper_idx.toString(),  
                                                     "field_name":"references",
                                                     "reference_id":ref_id.toString()
                                                    })].scrollIntoView({
                                                        block: "nearest",
                                                        inline: "start"
                                                    }); 

                                  }, 5)

                                  }
                            >
                          {text.slice( span.start, span.end )}
                          </Link>
                        )
                );
      
          }
      }

      return (
          <Box sx={{width:"100%", 
                    display: {display},
                    lineHeight:"normal",
                    mb:1
          }} >
              {
                text_spans.map( (item, idx) =>{
                    return item;
                } )
              }
          </Box>
      )
  }





  function write_sentence(  paper_idx, field_name, section_id, paragraph_id, sentence_id, 
                            sentence_text, spans, 
                            text_color, highlight_color ){

      const sen_key = JSON.stringify(
                              {
                                  "paper_idx":paper_idx.toString(), 
                                  "field_name":field_name.toString(),
                                  "section_id":section_id.toString(),
                                  "paragraph_id":paragraph_id.toString(),
                                  "sentence_id":sentence_id.toString()
                              })
      return (<Box key={ sen_key } 
                   ref={ el=>{ itemsRef.current[sen_key] = el }}
                   display = "inline" 
                   >
              {
                render_sentence( paper_idx, sentence_text, spans, "body1", "inline", text_color, highlight_color )
              }
              </Box>);

  }


  function write_paragraph( paper_idx, field_name, section_id, paragraph_id, paragraph_text, text_color, highlight_color  ){
      
      return ( <Box sx={{mb:1}}
              key = {paragraph_id.toString()}
        >
      {paragraph_text.map( (sen_item,idx)=>{
          return  write_sentence(  paper_idx, field_name, section_id, paragraph_id, 
                            sen_item.sentence_id, sen_item.sentence_text, 
                            sen_item.spans, text_color, highlight_color );
          } )}
      </Box>
      );
  }

  function write_section( paper_idx, field_name, section_id, section_title, section_text, text_color, highlight_color  ){
      
      return ( 
      <Box sx={{mb:1}}
           key={section_id.toString()}
      >
      <Typography component = "div" variant = "h6" text_color = {text_color} > {section_title} </Typography>
      {
          section_text.map( ( para_item, idx ) =>{
              return write_paragraph( paper_idx, field_name, section_id, 
                        para_item.paragraph_id, para_item.paragraph_text, 
                        text_color, highlight_color  );

          } )
      }
      </Box>
      );
  }

  function write_section_list( paper_idx, field_name, section_list, text_color, highlight_color  ){
      return ( 
        <Box sx={{mb:1}}
             key={field_name}
        >
          {

            section_list.map( (sec_item, idx)=>{
                return write_section( paper_idx, field_name, sec_item.section_id, 
                                    sec_item.section_title, sec_item.section_text, 
                                    text_color, highlight_color  )

            } )
          }
        </Box>
      )
  }


  function write_reference( paper_idx, references, text_color ){
      const field_name = "references";
      return ( 
        <Box sx={{mb:1}}
             key={field_name}
        >
          <Typography component = "div" variant="h6" text_color={text_color}> References </Typography>
          {
              references.map( (item, idx) =>{
                  // Typography(  ref_item.get("ReferenceText", ""), variant = variant, text_color = text_color  )
                  const ref_key = JSON.stringify(
                        {
                            "paper_idx":paper_idx.toString(),
                            "field_name":field_name,
                            "reference_id":idx.toString()
                        }
                    );
                  return (
                  <Typography 
                    key = {ref_key}
                    ref = { el=>{ itemsRef.current[ref_key] = el } }
                    variant = "body2" 
                    text_color = {text_color}>
                    {item.ReferenceText??""}
                  </Typography>
                  );
              } )

          }
        </Box>
      )
  }


  function display_paper_summary( paper_info, paper_idx, keywords = "", max_num_words_in_highlights = 35 ){
      const content_info = paper_info.content_info;
      const title = (content_info.Title??"").toString();
      const authors = content_info.Author??[];
      const author_text =  (authors.filter( (item, author_idx)=>{return (author_idx < 3)} ).map((item, _)=>{
          return (item.GivenName??"").slice(0, 1) +" " +  item.FamilyName??"";
      }).reduce((x,y)=> x +", " + y,"") + ( (authors.length > 3)?", et al":"" ) ).toString().slice(2);
      const venue = (content_info.Venue??"").toString();
      const year = ((content_info.PublicationDate??{}).Year??"").toString();
      const url = (content_info.URL??"").toString();
      const abstract = (content_info.Content??{}).Abstract_Parsed??[];
      const fullbody = (content_info.Content??{}).Fullbody_Parsed??[];
      const references = content_info.Reference??[];
      const highlights_info = paper_info.highlights_info;
      const generated_citation_info = paper_info.generated_citation_info;
      const is_showing_fulltext = paper_info.is_showing_fulltext;


      return (
          <Card key={paper_idx.toString()}
              sx={{mt:0,mb:2}}
          > 
              <CardHeader
                  ref = { el=>{ itemsRef.current[ JSON.stringify({"paper_idx":paper_idx.toString() }) ] = el } }
                  title = {title}
                  titleTypographyProps = {{"variant":"h6","fontWeight":"bold"}}
                  subheader = <Box
                      sx={{"fontWeight":"bold",
                           "fontFamily":'monospace'
                          }}
                    > 
                    {author_text +". " + venue + ", " + year}
                    <IconButton
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        sx={{ color:"primary.main" }}
                    >
                        <PictureAsPdfIcon />
                    </IconButton>
                  </Box>
                  sx={{ mb:-3, mt:-1,ml:-1}}
              />

              <Divider  sx = {{mt:1, mb:-1, ml:2.2, mr:3}} />
              <CardContent 
                  sx = {{mb:-4, ml:0.5, mr:1.5}}
              >

              {
                  highlights_info.map( (item, idx)=>{

                      const sen_words = item.text.split(" ");
                      const sen_words_truncated = sen_words.slice(0, max_num_words_in_highlights);
                      if (sen_words.length > max_num_words_in_highlights){
                          sen_words_truncated.push( "..." );
                      }
                      const sen_text = sen_words_truncated.join(" ");
                      const highlight_key = JSON.stringify({ "paper_idx":paper_idx.toString(),  
                                                 "field_name":"highlights",
                                                 "sentence_id":idx.toString(),
                                                });
                      
                      return (
                        <Box 
                          ref={ el=>{ itemsRef.current[highlight_key]=el } }
                          key={ highlight_key }
                          // display = "inline"
                          sx={{mb:0.5}}
                        >
                        
                        {write_highlighted_text( sen_text, item.highlight_spans, "body1", "inline", "text.primary", "primary.main" )}
                        
                        <Tooltip title="Read in fulltext" placement="right">
                        <IconButton 
                          sx={{ color:"primary.main" ,
                                mb:0,
                                mt:-0.5
                          }}
                          disabled = {item.matched_sen_id_info === null}
                          onClick = { ()=>{ 
                                if (item.matched_sen_id_info !== null){
                                    let new_paper_info_list = [...paperInfoList];
                                    const timeout_length =  paperInfoList[paper_idx].is_showing_fulltext?100:1000; // in ms

                                    new_paper_info_list[paper_idx].is_showing_fulltext = true;
                                    setPaperInfoList( new_paper_info_list );

                                    
                                    setTimeout( ()=>{  
                                          itemsRef.current[  
                                                JSON.stringify({ 
                                                     "paper_idx":paper_idx.toString(),  
                                                     "field_name":item.matched_sen_id_info.field_name.toString(),
                                                     "section_id":item.matched_sen_id_info.section_id.toString(),
                                                     "paragraph_id":item.matched_sen_id_info.paragraph_id.toString(),
                                                     "sentence_id":item.matched_sen_id_info.sentence_id.toString(),
                                                    })].scrollIntoView({
                                                        block: "center",
                                                        inline: "start"
                                                    }); 

                                      }, timeout_length);


                                    }  
                                  }
                          }

                        >
                        <MenuBookIcon  sx={{fontSize: "16px"}} />
                        </IconButton>

                        </Tooltip>

                        </Box>
                      )
                  } )
              }
              </CardContent>

              <Divider  sx = {{mt:2,ml:2.2, mr:3}} />
              <CardContent  
                  sx = {{mb:-4, mt:-1, ml:0}}
              >
                  
                  <Box  
                    sx={{ display: 'flex',
                          flexDirection: 'row',
                        }}>

                    <Box  
                      key = {0}
                      sx={{
                            width:25,
                            ml:-1,
                            mr:1.5,
                            mt:-1
                          }}>

                      <IconButton
                          sx={{"color": (selected_cited_paper_info!==null &&  selected_cited_paper_info.paper_idx === paper_idx)?"secondary.main":"primary.main"
                              }}
                          display="inline"

                          onClick={ async () =>{ 

                            if (selected_cited_paper_info!==null &&  selected_cited_paper_info.paper_idx === paper_idx){
                                input_gen_cit_ref.current.value = "";
                                set_selected_cited_paper_info(null);
                            }
                            else{

                                input_gen_cit_ref.current.value = generated_citation_info.text;
                                set_selected_cited_paper_info(

                                  JSON.parse(JSON.stringify(
                                    {
                                    "paper_idx":paper_idx,
                                    "paper_info":paper_info,
                                    "generated_citation_info":generated_citation_info 
                                    }

                                  ))
                                );   
    
                             }

                           } }
                      >
                          <FormatQuote /> 
                      </IconButton>

                    </Box>

                    <Box
                      key = {1}
                      bgcolor={ (selected_cited_paper_info!==null &&  selected_cited_paper_info.paper_idx === paper_idx)?"#b0bec5":null  }     
                    >

                       {write_highlighted_text( generated_citation_info.text, 
                                               generated_citation_info.highlight_spans, 
                                               "body1", "inline", "text.primary", "primary.main" )}

                    </Box>
                  </Box>
                      
              </CardContent>

              <Divider sx = {{mt:2.5,ml:2.2, mr:3}} />


              <CardActions 
                  sx={ {"mb":-1, "mt":-1,"ml":-1}}
                  style={ {"width": '100%', "justifyContent": 'flex-end' }}
              >
                  <Button 
                    size="small"
                    onClick={ 
                       ()=>{ 
                              let new_paper_info_list = [...paperInfoList];
                              new_paper_info_list[paper_idx].is_showing_fulltext = !new_paper_info_list[paper_idx].is_showing_fulltext;
                              setPaperInfoList( new_paper_info_list );
                           }
                    }
                  >
                  { is_showing_fulltext? "Hide Fulltext":"View Fulltext"  }
                  { is_showing_fulltext? <ExpandLess/>:<ExpandMore/>  }
                  </Button>

              </CardActions>
              <Collapse 
                  in = {is_showing_fulltext}
                  timeout = "auto"
              >
                  <CardContent>
                      {is_showing_fulltext? (
                            write_section_list( paper_idx, "abstract", abstract, "text.primary", "primary.main"  ) 
                        ):""
                      }
                      {is_showing_fulltext? (
                            write_section_list( paper_idx, "fullbody", fullbody, "text.primary", "primary.main"  )
                        ):""
                      }
                      {
                        (is_showing_fulltext && references.length >0 )? (
                            write_reference( paper_idx, references, "text.primary" )
                          ):""

                      }
                    
                  </CardContent>

              </Collapse>

          </Card>

      );

  }

  return (
  <ThemeProvider theme={theme}>
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            style={{ background:"#455a64" }}// '#2E3B55' }}
      >
        <Toolbar
          sx={{height: 30, width: "100%", mt:-1, mb:-1}}>
          <Box
            component="img"
            sx={{height: 35, width: 70, mt:-1, mb:-1}}
            src={logo}/>
          <Box
            sx={{width:"100%", display: "flex", justifyContent:"left",
                 fontWeight: 'bold',
                 mt:4, mb:2, ml:1}}>
            <Typography variant="h7" noWrap component="div">
              Joint Scientific Literature Discovery, Summarization and Citation Generation
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>






      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderWidth: 0 },       
          mr:0,
        }}>
        <Toolbar />

        <Box 
            display={"flex"} 
            flexDirection = {'row'}
                  >
          <Box  
              display={sidebarDisplay}
              sx={{
              width: drawerWidth-65,
              ml:1,
              mr:-0.5
          }}>

              <TextField 
                  inputRef = {input_context_ref}
                  label = "Context Text"
                  variant="filled"
                  multiline = {true}
                  maxRows = {(windowSize.innerHeight - 290 ) /2 / 25}
                  minRows = {(windowSize.innerHeight - 290) /2 / 25}
                  sx = {{ "width":"100%", 
                          "mb":2,
                          "mt":2
                        }}
              >
              </TextField>

              <TextField 
                  inputRef = {input_keywords_ref}
                  label = "Keywords"
                  variant="filled"
                  sx = {{ "width":"100%", "mb":2}}
              >
              </TextField>

              <Button 
                  variant = "contained"
                  endIcon = {<SearchIcon />}
                  onClick = {callback_search_pipeline}  
              >
                <Box
                    sx={{fontWeight: 'bold'}}> Search
                </Box>
              </Button>

              <Box 
                display = "inline"
                sx = {{ml:1}}>
              <Button 
                  variant = "contained"
                  endIcon = {<BuildOutlinedIcon />}
                  disabled = {selected_cited_paper_info === null}
                  onClick = { async ()=>{ 

                      // generate_citations_for_papers
                      const paper_info = selected_cited_paper_info.paper_info;
                      const context = input_context_ref.current.value;
                      const keywords = input_keywords_ref.current.value;

                      const new_gen_text_list = await generate_citations_for_papers( [paper_info.content_info], context, keywords );
                      const new_gen_text = await new_gen_text_list[0];
                      


                      input_gen_cit_ref.current.value = new_gen_text;

                      const new_spans_gen_sen = await text_processing( 
                          {
                               data:{ 
                                  text:new_gen_text,
                                  keywords:keywords
                                },
                                mode:"highlight_text_given_keywords"
                          } );  
                      const new_generated_citation_info = { text:new_gen_text, highlight_spans:new_spans_gen_sen }

                      let new_selected_cited_paper_info = JSON.parse( JSON.stringify( selected_cited_paper_info ) );
                      new_selected_cited_paper_info["generated_citation_info"] = new_generated_citation_info;
                      set_selected_cited_paper_info( new_selected_cited_paper_info );

                   }}
              >
                <Box
                    sx={{fontWeight: 'bold'}}> Finetune Generation
                </Box>
              </Button>
              </Box>

              <Box sx={ {display: (() => { return ( (log_search_progress!=="")? "flex":"none") })(),
                         height:20,
                         pt:1,
                         pl:1
               }}>
                  <CircularProgress 
                    size="1.2rem"
                    sx={{ 
                         pr:-2,
                         }}
                  />
                  <Typography 
                      sx={{ 
                         pl:2,
                         }}
                      variant="body2"
                  >
                     {log_search_progress}
                  </Typography>
              </Box>

              <TextField 
                  inputRef = { input_gen_cit_ref }
                  label = "Selected Citation Text"
                  variant="filled"
                  multiline = {true}
                  maxRows = {(windowSize.innerHeight - 290 ) /2 / 25}
                  minRows = {(windowSize.innerHeight - 290) /2 / 25}
                  sx = {{ "width":"100%", "mt":2.2}}
                  InputLabelProps={{ shrink: true }}

              >
              </TextField>


              <Box 
                display = "flex"
                flexDirection = "row"
              >

                  <Button 
                    size="small"
                    disabled = {selected_cited_paper_info === null}
                    onClick={ 
                       async ()=>{ 

                              set_export_citation_progress("exporting citation")

                              const paper_idx = selected_cited_paper_info.paper_idx;
                              const paper_info = selected_cited_paper_info.paper_info;
                              const generated_citation_info = selected_cited_paper_info.generated_citation_info;

                              let cit_info = null
                              try{
                                  cit_info = await export_citation( paper_info.id_info );
                                  cit_info = await cit_info[0];
                              }catch{
                                  cit_info = {"bibtex":"", "mla":""};
                              }   

                              set_export_citation_bibtex(cit_info.bibtex);
                              set_export_citation_mla(cit_info.mla);

                              set_selected_cited_paper_info( {
                                    "paper_idx":paper_idx,
                                    "paper_info":paper_info,
                                    "generated_citation_info":generated_citation_info,
                                    "cit_info": cit_info,
                                } );

                              set_export_citation_progress( "" );
                              set_open_export_citation(true);

                           }
                         }
                     >
                    <Box fontWeight= 'bold' > Export Citation </Box>
                  </Button>

                  <Box sx={ {display: export_citation_progress!==""?"flex":"none",
                         height:20,
                         pt:1,
                         pl:1
                        }}>
                            <CircularProgress 
                              size="1rem"
                              sx={{ 
                                  pr:-2,
                                  }}
                            />
                  </Box>
              </Box>

              <Dialog
                  open={open_export_citation}
                  onClose={()=>{ set_open_export_citation(false); } }
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
              >
                  <DialogContent>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                          <Tabs value={export_citation_tab_value} onChange={(event, newValue)=>{ set_export_citation_tab_value(newValue) }} aria-label="basic tabs example">
                            <Tab label="BibTex" {...a11yProps(0)} />
                            <Tab label="MLA" {...a11yProps(1)} />
                          </Tabs>
                        </Box>
                        <TabPanel value={export_citation_tab_value} index={0}>
                          <Box sx={{ width: 400 }}>

                          <TextField 
                            label = "BibTex"
                            multiline = {true}
                            rows={8}
                            sx = {{ "width":"100%", "mt":2.2}}
                            InputLabelProps={{ shrink: true }}
                            value = {export_citation_bibtex}
                          >
                          </TextField>

                          <Box 
                            sx={{ width: 400, mt:2}}
                            display = 'flex'
                            flexDirection = 'row'
                            justifyContent = 'flex-end'
                          >
 
                           <IconButton 
                            sx={{"color":"primary.main"}}
                            display="inline"
                            onClick = {
                              ()=>{
                                  navigator.clipboard.writeText( export_citation_bibtex );
                                  set_toast_copied_open(true);
                              }
                            }
                            >
                              <ContentCopyIcon fontSize="normal"/>
                            </IconButton>
                            <Snackbar  
                                open={toast_copied_open}
                                autoHideDuration={2000}
                                onClose={()=>{set_toast_copied_open(false)}}
                                message="Copied to clipboard!"
                                action={ null }
                            />
                          </Box>
                          </Box>
                        </TabPanel>

                        <TabPanel value={export_citation_tab_value} index={1}>
                          <Box sx={{ width: 400 }}>

                          <TextField 
                            label = "MLA"
                            multiline = {true}
                            rows={8}
                            sx = {{ "width":"100%", "mt":2.2}}
                            InputLabelProps={{ shrink: true }}
                            value = {export_citation_mla}
                          >
                          </TextField>

                          <Box 
                            sx={{ width: 400 , mt:2}}
                            display = 'flex'
                            flexDirection = 'row'
                            justifyContent = 'flex-end'
                          >
                          <IconButton 
                            sx={{"color":"primary.main"}}
                            display="inline"
                            onClick = {
                              ()=>{
                                  navigator.clipboard.writeText( export_citation_mla );
                                  set_toast_copied_open(true);
                              }
                            }
                            >
                              <ContentCopyIcon fontSize="normal"/>
                            </IconButton>
                            <Snackbar  
                                open={toast_copied_open}
                                autoHideDuration={2000}
                                onClose={()=>{set_toast_copied_open(false)}}
                                message="Copied to clipboard!"
                                action={ null }
                            />
                          </Box>

                          </Box>
                        </TabPanel>


                      </Box>

                  </DialogContent>
            </Dialog>

          </Box>

          <Box  
              display = 'flex'
              flexDirection = 'column'
              justifyContent = 'center'
              sx={{
              width: 25 ,
              height: windowSize.innerHeight-100,
              ml:(sidebarStatus)?0.5:0 
          }}>

             {(() => {
                if (sidebarStatus) {
                  return (
                    <KeyboardArrowLeftIcon  onClick={ updateSidebarStatus} />
                  )
                } 
                else {
                  return (
                    <KeyboardArrowRightIcon  onClick={ updateSidebarStatus} />
                  )
                }
            })()}

          </Box>

          <Divider orientation="vertical"
                  sx={{
              height: windowSize.innerHeight-50,
              mt:-2
            }}
          ></Divider>

          <Box  
            display= "flex"

            flexDirection="column"
            justifyContent="center"
            sx={{ 
                    width:20,
                    height:windowSize.innerHeight-100,
                    mr :0,
                    ml :1
                  }}>

                { (()=>{
                    // const is_showing_fulltext_list = paperInfoList.slice( paper_offset, paper_offset+num_papers_per_page).filter((item,idx)=>{
                    //     return item.is_showing_fulltext;})

                    let opened_paper_idx = null;
                    for (let i=paper_offset; i< Math.min( paper_offset+num_papers_per_page ,paperInfoList.length); i++ ){
                        if (paperInfoList[i].is_showing_fulltext){
                            opened_paper_idx = i;
                            break;
                        }
                    }

                    if (opened_paper_idx!== null){
                        return (
                          <IconButton 
                            sx={{"color":"#455a64"}}
                            display="inline"
                            onClick = {
                              ()=>{

                                  const new_paper_info_list = paperInfoList.map((item, idx)=>{
                                      if( idx >= paper_offset &&
                                          idx < paper_offset + num_papers_per_page){
                                            item.is_showing_fulltext = false;
                                            return item;
                                        }else{
                                            return item;
                                        }
                                  });
                                  setPaperInfoList( new_paper_info_list );

                                  setTimeout( ()=>{  
                                      itemsRef.current[  
                                          JSON.stringify({ "paper_idx":opened_paper_idx.toString()})].scrollIntoView({
                                                        block: "center",
                                                        inline: "start"
                                                    }); 

                                      }, 50);

                              }

                            }

                          >
                            <UnfoldLessDoubleIcon fontSize="normal"/>
                          </IconButton>
                          );

                    }else{
                        return "";
                    }

                })() }

               
          </Box>

        </Box>
      
      </Drawer>


      <Box component="main" 
            sx={{ 
                                  flexGrow: 1, 
                                  p: 3,
                                  mt:-1.5,
                                  ml:-2
         }}>
        <Toolbar />

          {  paperInfoList.map( (item, idx)=>{  
              // if (idx >= paper_offset && 
              //     idx < paper_offset+ num_papers_per_page && 
              //     idx < paperInfoList.length){
              //     return {
              //         paper_info:item,
              //         paper_idx:idx,
              //     };
              // }else{
              //     return {
              //         paper_info:item,
              //         paper_idx:idx,
              //     };
              // }
                  return {
                      paper_info:item,
                      paper_idx:idx,
                  };

            } ).filter( (item, idx)=>{return (idx >= paper_offset && 
                  idx < paper_offset+ num_papers_per_page && 
                  idx < paperInfoList.length) } ).map( (item, idx)=>{
                  return  display_paper_summary(item.paper_info, item.paper_idx);

              } )   }


          { (()=> {
            if (paperInfoList.length > 0){
                return (
                  <Box
                    display = "flex"
                    justifyContent = "center"
                    sx={{ "width":"100%", pt:2 }}
                  >
                      <Pagination 
                          page =  { Math.floor(paper_offset / num_papers_per_page )+ 1 } 
                          count=  { Math.ceil( paperInfoList.length / num_papers_per_page ) }  
                          showFirstButton 
                          showLastButton 
                          onChange = { async (event, value)=>{  
                              

                              const new_paper_offset = Math.max(value -1, 0) * num_papers_per_page;
                              if (new_paper_offset !== paper_offset ){
                                  const unloaded_paper_infos = paperInfoList.slice(new_paper_offset, 
                                        new_paper_offset+num_papers_per_page).filter( (item, idx) =>{
                                             return ( item.generated_citation_info === undefined  );
                                           }
                                        );
                                  if (unloaded_paper_infos.length >0){
                                      const paper_id_list_slice = paperInfoList.slice(new_paper_offset, 
                                        new_paper_offset+num_papers_per_page).map( (item, idx)=>{
                                            return item.id_info;
                                        } )
                                      const context = input_context_ref.current.value;
                                      const keywords = input_keywords_ref.current.value;


                                      const paper_info_list_slice = await callback_paginating_papers( paper_id_list_slice, context, keywords );


                                      const paper_info_list = paperInfoList.map( (item, idx)=>{
                                          if ( idx >= new_paper_offset &&
                                               idx < new_paper_offset + num_papers_per_page &&
                                               idx - new_paper_offset < paper_info_list_slice.length
                                              ){
                                             return paper_info_list_slice[ idx - new_paper_offset ];
                                          }else{
                                             return item;
                                          }

                                      } );

                                      set_paper_offset( new_paper_offset );
                                      setPaperInfoList( paper_info_list );

                                  }else{
                                      set_paper_offset( new_paper_offset );
                                  }

                              }

                          } }>
                      </Pagination>

                  </Box>

                  );
            }
            })()
          }


      </Box>
    </Box>
  </ThemeProvider>
  );
}

