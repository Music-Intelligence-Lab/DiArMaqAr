"""
Dynamic Arabic text converter with diacritics and transliteration support.

Provides comprehensive conversion between Arabic script, transliteration,
and romanized forms with support for musical terminology and maqam names.
"""

import re
from typing import Dict, Optional, List, Tuple
from dataclasses import dataclass


@dataclass
class ArabicConversionRule:
    """Represents a conversion rule for Arabic text."""
    arabic: str
    transliteration: str
    romanized: str
    context: Optional[str] = None  # Optional context for conditional application


class DynamicArabicConverter:
    """
    Dynamic converter for Arabic musical terminology with contextual rules.
    """
    
    def __init__(self):
        self.base_rules = self._initialize_base_rules()
        self.maqam_rules = self._initialize_maqam_rules()
        self.jins_rules = self._initialize_jins_rules()
        self.musical_terms = self._initialize_musical_terms()
        self.diacritics_map = self._initialize_diacritics()
        
    def _initialize_base_rules(self) -> List[ArabicConversionRule]:
        """Initialize base Arabic to Latin conversion rules."""
        return [
            # Basic consonants
            ArabicConversionRule("ب", "b", "b"),
            ArabicConversionRule("ت", "t", "t"),
            ArabicConversionRule("ث", "th", "th"),
            ArabicConversionRule("ج", "j", "j"),
            ArabicConversionRule("ح", "ḥ", "h"),
            ArabicConversionRule("خ", "kh", "kh"),
            ArabicConversionRule("د", "d", "d"),
            ArabicConversionRule("ذ", "dh", "dh"),
            ArabicConversionRule("ر", "r", "r"),
            ArabicConversionRule("ز", "z", "z"),
            ArabicConversionRule("س", "s", "s"),
            ArabicConversionRule("ش", "sh", "sh"),
            ArabicConversionRule("ص", "ṣ", "s"),
            ArabicConversionRule("ض", "ḍ", "d"),
            ArabicConversionRule("ط", "ṭ", "t"),
            ArabicConversionRule("ظ", "ẓ", "z"),
            ArabicConversionRule("ع", "ʿ", "'"),
            ArabicConversionRule("غ", "gh", "gh"),
            ArabicConversionRule("ف", "f", "f"),
            ArabicConversionRule("ق", "q", "q"),
            ArabicConversionRule("ك", "k", "k"),
            ArabicConversionRule("ل", "l", "l"),
            ArabicConversionRule("م", "m", "m"),
            ArabicConversionRule("ن", "n", "n"),
            ArabicConversionRule("ه", "h", "h"),
            ArabicConversionRule("و", "w", "w"),
            ArabicConversionRule("ي", "y", "y"),
            
            # Hamza variations
            ArabicConversionRule("ء", "ʾ", "'"),
            ArabicConversionRule("أ", "ʾa", "a"),
            ArabicConversionRule("إ", "ʾi", "i"),
            ArabicConversionRule("آ", "ʾā", "aa"),
            ArabicConversionRule("ؤ", "ʾu", "u"),
            ArabicConversionRule("ئ", "ʾi", "i"),
            
            # Long vowels
            ArabicConversionRule("ا", "ā", "a"),
            ArabicConversionRule("و", "ū", "u", "vowel"),
            ArabicConversionRule("ي", "ī", "i", "vowel"),
            
            # Ta marbuta
            ArabicConversionRule("ة", "a", "a"),
        ]
    
    def _initialize_maqam_rules(self) -> Dict[str, ArabicConversionRule]:
        """Initialize maqam-specific conversion rules."""
        return {
            "عجم": ArabicConversionRule("عجم", "ʿajam", "ajam"),
            "بياتي": ArabicConversionRule("بياتي", "bayātī", "bayati"),
            "صبا": ArabicConversionRule("صبا", "ṣabā", "saba"),
            "حجاز": ArabicConversionRule("حجاز", "ḥijāz", "hijaz"),
            "راست": ArabicConversionRule("راست", "rāst", "rast"),
            "سيكا": ArabicConversionRule("سيكا", "sīkā", "sika"),
            "كرد": ArabicConversionRule("كرد", "kurd", "kurd"),
            "نهاوند": ArabicConversionRule("نهاوند", "nahāwand", "nahawand"),
            "عشاق": ArabicConversionRule("عشاق", "ʿushshāq", "ushshaq"),
            "زنجران": ArabicConversionRule("زنجران", "zanjarān", "zanjaran"),
            "نكريز": ArabicConversionRule("نكريز", "nakrīz", "nakriz"),
            "عراق": ArabicConversionRule("عراق", "ʿirāq", "iraq"),
            "إصفهان": ArabicConversionRule("إصفهان", "iṣfahān", "isfahan"),
            "يكاه": ArabicConversionRule("يكاه", "yakāh", "yakah"),
            "دوكاه": ArabicConversionRule("دوكاه", "dūkāh", "dukah"),
            "سيكاه": ArabicConversionRule("سيكاه", "sīkāh", "sikah"),
            "جهاركاه": ArabicConversionRule("جهاركاه", "jahārkāh", "jaharkah"),
            "نوا": ArabicConversionRule("نوا", "nawā", "nawa"),
            "حسيني": ArabicConversionRule("حسيني", "ḥusaynī", "husayni"),
            "أوج": ArabicConversionRule("أوج", "awj", "awj"),
            "كردان": ArabicConversionRule("كردان", "kurdān", "kurdan"),
            "محير": ArabicConversionRule("محير", "muḥayyar", "muhayyar"),
        }
    
    def _initialize_jins_rules(self) -> Dict[str, ArabicConversionRule]:
        """Initialize jins-specific conversion rules."""
        return {
            "عجم": ArabicConversionRule("عجم", "ʿajam", "ajam"),
            "بياتي": ArabicConversionRule("بياتي", "bayātī", "bayati"),
            "صبا": ArabicConversionRule("صبا", "ṣabā", "saba"),
            "حجاز": ArabicConversionRule("حجاز", "ḥijāz", "hijaz"),
            "راست": ArabicConversionRule("راست", "rāst", "rast"),
            "سيكا": ArabicConversionRule("سيكا", "sīkā", "sika"),
            "كرد": ArabicConversionRule("كرد", "kurd", "kurd"),
            "نهاوند": ArabicConversionRule("نهاوند", "nahāwand", "nahawand"),
            "نكريز": ArabicConversionRule("نكريز", "nakrīz", "nakriz"),
            "حجاز كار": ArabicConversionRule("حجاز كار", "ḥijāz kār", "hijaz kar"),
            "أثر كرد": ArabicConversionRule("أثر كرد", "athar kurd", "athar kurd"),
            "مستعار": ArabicConversionRule("مستعار", "mustaʿār", "musta'ar"),
            "زنكولا": ArabicConversionRule("زنكولا", "zankulā", "zankula"),
        }
    
    def _initialize_musical_terms(self) -> Dict[str, ArabicConversionRule]:
        """Initialize general musical terminology."""
        return {
            "مقام": ArabicConversionRule("مقام", "maqām", "maqam"),
            "مقامات": ArabicConversionRule("مقامات", "maqāmāt", "maqamat"),
            "جنس": ArabicConversionRule("جنس", "jins", "jins"),
            "أجناس": ArabicConversionRule("أجناس", "ajnās", "ajnas"),
            "سير": ArabicConversionRule("سير", "sayr", "sayr"),
            "سلم": ArabicConversionRule("سلم", "sullam", "sullam"),
            "طقطوقة": ArabicConversionRule("طقطوقة", "ṭaqṭūqa", "taqtuqa"),
            "موشح": ArabicConversionRule("موشح", "muwashshaḥ", "muwashshah"),
            "قصيدة": ArabicConversionRule("قصيدة", "qaṣīda", "qasida"),
            "دور": ArabicConversionRule("دور", "dawr", "dawr"),
            "وصلة": ArabicConversionRule("وصلة", "waṣla", "wasla"),
            "تقسيم": ArabicConversionRule("تقسيم", "taqsīm", "taqsim"),
            "سماعي": ArabicConversionRule("سماعي", "samāʿī", "sama'i"),
            "لونغا": ArabicConversionRule("لونغا", "lūnghā", "lungha"),
            "بشرف": ArabicConversionRule("بشرف", "bashraf", "bashraf"),
            "فاصل": ArabicConversionRule("فاصل", "fāṣil", "fasil"),
            "ميزان": ArabicConversionRule("ميزان", "mīzān", "mizan"),
            "إيقاع": ArabicConversionRule("إيقاع", "īqāʿ", "iqa'"),
            "تحويل": ArabicConversionRule("تحويل", "taḥwīl", "tahwil"),
            "انتقال": ArabicConversionRule("انتقال", "intiqāl", "intiqal"),
        }
    
    def _initialize_diacritics(self) -> Dict[str, str]:
        """Initialize diacritical marks mapping."""
        return {
            # Short vowels
            "َ": "a",    # Fatha
            "ِ": "i",    # Kasra
            "ُ": "u",    # Damma
            "ْ": "",     # Sukun (no vowel)
            "ً": "an",   # Tanwin fath
            "ٍ": "in",   # Tanwin kasr
            "ٌ": "un",   # Tanwin damm
            "ّ": "",     # Shadda (gemination)
            "ٰ": "ā",    # Alif khanjariyya
            "ٓ": "",     # Maddah
            "ٔ": "ʾ",    # Hamza above
            "ٕ": "ʾ",    # Hamza below
        }
    
    def remove_diacritics(self, text: str) -> str:
        """Remove all diacritical marks from Arabic text."""
        for diacritic in self.diacritics_map.keys():
            text = text.replace(diacritic, "")
        return text
    
    def extract_diacritics(self, text: str) -> List[Tuple[int, str]]:
        """Extract diacritics and their positions from text."""
        diacritics = []
        for i, char in enumerate(text):
            if char in self.diacritics_map:
                diacritics.append((i, char))
        return diacritics
    
    def to_transliteration(self, arabic_text: str, preserve_diacritics: bool = True) -> str:
        """
        Convert Arabic text to scientific transliteration.
        
        Args:
            arabic_text: Arabic text to convert
            preserve_diacritics: Whether to include diacritics in transliteration
            
        Returns:
            Transliterated text
        """
        if not arabic_text:
            return ""
        
        # Check for specialized terms first
        for term_dict in [self.maqam_rules, self.jins_rules, self.musical_terms]:
            if arabic_text in term_dict:
                return term_dict[arabic_text].transliteration
        
        result = arabic_text
        
        # Apply diacritics if preserving them
        if preserve_diacritics:
            for diacritic, transliteration in self.diacritics_map.items():
                result = result.replace(diacritic, transliteration)
        else:
            result = self.remove_diacritics(result)
        
        # Apply base conversion rules
        for rule in self.base_rules:
            if rule.context != "vowel" or not preserve_diacritics:
                result = result.replace(rule.arabic, rule.transliteration)
        
        return result
    
    def to_romanized(self, arabic_text: str) -> str:
        """
        Convert Arabic text to simplified romanized form.
        
        Args:
            arabic_text: Arabic text to convert
            
        Returns:
            Romanized text
        """
        if not arabic_text:
            return ""
        
        # Check for specialized terms first
        for term_dict in [self.maqam_rules, self.jins_rules, self.musical_terms]:
            if arabic_text in term_dict:
                return term_dict[arabic_text].romanized
        
        result = self.remove_diacritics(arabic_text)
        
        # Apply base conversion rules
        for rule in self.base_rules:
            result = result.replace(rule.arabic, rule.romanized)
        
        return result
    
    def detect_language(self, text: str) -> str:
        """
        Detect if text is Arabic, transliteration, or romanized.
        
        Args:
            text: Text to analyze
            
        Returns:
            Language type: 'arabic', 'transliteration', or 'romanized'
        """
        # Check for Arabic characters
        arabic_pattern = re.compile(r'[\u0600-\u06FF]')
        if arabic_pattern.search(text):
            return "arabic"
        
        # Check for transliteration markers
        transliteration_markers = ['ḥ', 'ṣ', 'ḍ', 'ṭ', 'ẓ', 'ʿ', 'ʾ', 'ā', 'ī', 'ū']
        if any(marker in text for marker in transliteration_markers):
            return "transliteration"
        
        return "romanized"
    
    def convert_between_formats(self, text: str, target_format: str) -> str:
        """
        Convert between different text formats.
        
        Args:
            text: Input text
            target_format: Target format ('arabic', 'transliteration', 'romanized')
            
        Returns:
            Converted text
        """
        current_format = self.detect_language(text)
        
        if current_format == target_format:
            return text
        
        if current_format == "arabic":
            if target_format == "transliteration":
                return self.to_transliteration(text)
            elif target_format == "romanized":
                return self.to_romanized(text)
        
        # For non-Arabic inputs, we'd need reverse lookup dictionaries
        # This is a simplified implementation
        return text
    
    def normalize_arabic_text(self, text: str) -> str:
        """
        Normalize Arabic text by standardizing character variants.
        
        Args:
            text: Arabic text to normalize
            
        Returns:
            Normalized text
        """
        # Character normalization mappings
        normalizations = {
            'ك': 'ك',  # Normalize different kaf forms
            'ي': 'ي',  # Normalize different ya forms
            'ة': 'ة',  # Normalize ta marbuta
            'ء': 'ء',  # Normalize hamza
        }
        
        result = text
        for original, normalized in normalizations.items():
            result = result.replace(original, normalized)
        
        return result
    
    def add_custom_rule(self, arabic: str, transliteration: str, romanized: str, context: str = None):
        """
        Add a custom conversion rule.
        
        Args:
            arabic: Arabic text
            transliteration: Transliterated form
            romanized: Romanized form
            context: Optional context for the rule
        """
        rule = ArabicConversionRule(arabic, transliteration, romanized, context)
        self.base_rules.append(rule)
    
    def get_conversion_suggestions(self, text: str) -> List[str]:
        """
        Get multiple conversion suggestions for ambiguous text.
        
        Args:
            text: Text to convert
            
        Returns:
            List of possible conversions
        """
        suggestions = []
        
        # Add direct conversions
        suggestions.append(self.to_transliteration(text))
        suggestions.append(self.to_romanized(text))
        
        # Add variants without diacritics
        if self.detect_language(text) == "arabic":
            suggestions.append(self.to_transliteration(text, preserve_diacritics=False))
        
        # Remove duplicates while preserving order
        seen = set()
        unique_suggestions = []
        for suggestion in suggestions:
            if suggestion not in seen:
                seen.add(suggestion)
                unique_suggestions.append(suggestion)
        
        return unique_suggestions


# Create a global instance for easy access
arabic_converter = DynamicArabicConverter()


def convert_arabic_text(
    text: str,
    target_format: str = "transliteration",
    preserve_diacritics: bool = True
) -> str:
    """
    Convenience function for Arabic text conversion.
    
    Args:
        text: Arabic text to convert
        target_format: Target format ('transliteration', 'romanized')
        preserve_diacritics: Whether to preserve diacritics
        
    Returns:
        Converted text
    """
    if target_format == "transliteration":
        return arabic_converter.to_transliteration(text, preserve_diacritics)
    elif target_format == "romanized":
        return arabic_converter.to_romanized(text)
    else:
        return text


def normalize_maqam_name(name: str) -> str:
    """
    Normalize a maqam name to standard transliteration.
    
    Args:
        name: Maqam name in any format
        
    Returns:
        Normalized name
    """
    # First try direct lookup
    if name in arabic_converter.maqam_rules:
        return arabic_converter.maqam_rules[name].transliteration
    
    # Try converting if it's Arabic
    if arabic_converter.detect_language(name) == "arabic":
        return arabic_converter.to_transliteration(name)
    
    return name


def normalize_jins_name(name: str) -> str:
    """
    Normalize a jins name to standard transliteration.
    
    Args:
        name: Jins name in any format
        
    Returns:
        Normalized name
    """
    # First try direct lookup
    if name in arabic_converter.jins_rules:
        return arabic_converter.jins_rules[name].transliteration
    
    # Try converting if it's Arabic
    if arabic_converter.detect_language(name) == "arabic":
        return arabic_converter.to_transliteration(name)
    
    return name
