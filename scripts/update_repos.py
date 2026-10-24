#!/usr/bin/env python3
"""
Syncs GitHub repositories and hosted Pages into src/data/repos.json and public/repos.json.

Can be run:
  1. Manually or via GitHub Actions workflow_dispatch to sync all repos:
     python3 scripts/update_repos.py
  2. To add / update a specific repo:
     python3 scripts/update_repos.py --repo 100days-of-llvm --category "Compilers & LLVM"
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error

USER = "nageshnnazare"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_FILE = os.path.join(PROJECT_ROOT, "src", "data", "repos.json")
PUBLIC_FILE = os.path.join(PROJECT_ROOT, "public", "repos.json")

DEFAULT_CATEGORIES = {
    "Compilers & LLVM": [
        "100days-of-llvm", "llvm-know-hows", "compiler-optimization-know-hows", "lld-know-hows", "cynide"
    ],
    "C++ & Modern Standards": [
        "cpp-hpc", "cpp-oops", "cpp-stl", "how-to-stl", "cpp-smart-ptrs", 
        "cpp-stl-know-hows", "cpp-traits", "cpp-templates", "cpp-know-hows", 
        "cpp-excp", "cpp-casting", "cpp-atomics", "cpp17_complete_guide", 
        "modern-cpp-book-notes", "cpp_core_guidelines"
    ],
    "Concurrency & High Performance": [
        "threading-know-hows", "tbb-know-hows", "cuda-know-hows", "unix_threads_with_pthread_lib"
    ],
    "Low-Level & OS Systems": [
        "low-level-stuff", "nasm-know-hows", "asm-know-hows", "system-calls-know-hows", 
        "os-know-hows", "comp-arch-know-hows", "linux-memory-know-hows", "driver-know-hows",
        "socketProgramming"
    ],
    "Machine Learning & AI": [
        "gzip-knn-classifier", "pytorch-know-hows", "llm-know-hows", "ml-know-hows", "CaML", "recos"
    ],
    "Languages & Hardware": [
        "python-know-hows", "Python-Advanced-Concepts", "verilog-know-hows", "perl-know-hows", 
        "bash-know-hows", "Bash-Basics", "tcl-know-hows", "rust-projects"
    ],
    "Tools, Patterns & Graphics": [
        "design-patterns-know-hows", "git-know-hows", "docker-know-hows", "boost-know-hows", 
        "htmler.sh", "figkit", "dsa-know-hows", "raylib-know-hows", "ncurses-know-hows", "px", "pdfer"
    ]
}

def guess_category(name, desc=""):
    name_l = name.lower()
    desc_l = (desc or "").lower()

    for cat, repos in DEFAULT_CATEGORIES.items():
        for r in repos:
            if r.lower() == name_l:
                return cat

    if any(k in name_l or k in desc_l for k in ["llvm", "compiler", "lld", "clang", "opt"]):
        return "Compilers & LLVM"
    if any(k in name_l or k in desc_l for k in ["cpp", "c++", "stl", "templates"]):
        return "C++ & Modern Standards"
    if any(k in name_l or k in desc_l for k in ["thread", "tbb", "cuda", "concurrency", "lock", "atomic"]):
        return "Concurrency & High Performance"
    if any(k in name_l or k in desc_l for k in ["asm", "nasm", "system", "os", "kernel", "driver", "arch", "linux", "memory"]):
        return "Low-Level & OS Systems"
    if any(k in name_l or k in desc_l for k in ["ml", "llm", "pytorch", "classifier", "neural", "learning"]):
        return "Machine Learning & AI"
    if any(k in name_l or k in desc_l for k in ["python", "verilog", "perl", "bash", "shell", "rust", "tcl"]):
        return "Languages & Hardware"
    return "Tools, Patterns & Graphics"

def get_headers():
    headers = {"User-Agent": "python-script"}
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"token {token}"
    return headers

def fetch_json(url):
    req = urllib.request.Request(url, headers=get_headers())
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)

def load_existing():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return []

def save_repos(repos_list):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    os.makedirs(os.path.dirname(PUBLIC_FILE), exist_ok=True)
    
    # Sort repos alphabetically by name
    repos_list.sort(key=lambda r: r["name"].lower())
    
    with open(DATA_FILE, "w") as f:
        json.dump(repos_list, f, indent=2)
    with open(PUBLIC_FILE, "w") as f:
        json.dump(repos_list, f, indent=2)

def sync_single_repo(repo_name, category_override=None):
    print(f"Fetching details for repo: {repo_name}...")
    url = f"https://api.github.com/repos/{USER}/{repo_name}"
    try:
        r = fetch_json(url)
    except urllib.error.HTTPError as e:
        print(f"Error fetching repo {repo_name}: {e}")
        sys.exit(1)

    existing = load_existing()
    existing_dict = {item["name"].lower(): item for item in existing}

    name = r["name"]
    desc = r.get("description") or "Tutorial / Know-how repository"
    has_pages = bool(r.get("has_pages", False))
    demo_url = f"https://{USER}.github.io/{name}/" if has_pages else None

    category = category_override or existing_dict.get(name.lower(), {}).get("category") or guess_category(name, desc)

    entry = {
        "name": name,
        "category": category,
        "description": desc,
        "github": r["html_url"],
        "demo": demo_url,
        "has_pages": has_pages,
        "stars": r.get("stargazers_count", 0),
        "language": r.get("language") or "",
        "updated_at": r.get("updated_at", "")
    }

    existing_dict[name.lower()] = entry
    save_repos(list(existing_dict.values()))
    print(f"Successfully saved {name} (Category: {category}, Hosted: {has_pages})")

def sync_all_repos():
    print(f"Fetching all public repos for {USER}...")
    url = f"https://api.github.com/users/{USER}/repos?per_page=100&type=owner"
    repos = fetch_json(url)

    existing = load_existing()
    existing_cat = {item["name"].lower(): item.get("category") for item in existing}

    result = []
    for r in repos:
        if r.get("fork"):
            continue
        name = r["name"]
        if name in ["nageshnnazare", "nageshnnazare.github.io"]:
            continue

        desc = r.get("description") or "Tutorial / Know-how repository"
        has_pages = bool(r.get("has_pages", False))
        demo_url = f"https://{USER}.github.io/{name}/" if has_pages else None

        category = existing_cat.get(name.lower()) or guess_category(name, desc)

        result.append({
            "name": name,
            "category": category,
            "description": desc,
            "github": r["html_url"],
            "demo": demo_url,
            "has_pages": has_pages,
            "stars": r.get("stargazers_count", 0),
            "language": r.get("language") or "",
            "updated_at": r.get("updated_at", "")
        })

    save_repos(result)
    print(f"Successfully synced {len(result)} repos to {DATA_FILE} and {PUBLIC_FILE}")

def main():
    parser = argparse.ArgumentParser(description="Update portfolio repos data")
    parser.add_argument("--repo", help="Specific repository name to add or update")
    parser.add_argument("--category", help="Category for the specified repo")
    args = parser.parse_args()

    if args.repo:
        sync_single_repo(args.repo.strip(), args.category)
    else:
        sync_all_repos()

if __name__ == "__main__":
    main()
