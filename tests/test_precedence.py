from sloperator.runner import run_source


def test_example_runs_cleanly():
    result = run_source("hallucinate(2 + 5 * 3)✨\n")
    assert result.stderr == ""
    assert result.exit_code == 0
    assert result.stdout == "17\n"
